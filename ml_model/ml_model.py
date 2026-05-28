import pandas as pd
import numpy as np
import os
import joblib
from tqdm import tqdm
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model
from transformers import AutoTokenizer, TFAutoModel

class MultiModalPricePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.image_model = None
        self.tokenizer = None
        self.text_model = None
        self.setup_image_feature_extractor()
        self.setup_text_feature_extractor()

    def setup_image_feature_extractor(self):
        print("Setting up image feature extractor...")
        base_model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
        self.image_model = Model(inputs=base_model.input, outputs=base_model.output)

    def setup_text_feature_extractor(self):
        print("Setting up text feature extractor...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            self.text_model = TFAutoModel.from_pretrained('distilbert-base-uncased')
        except:
            print("Warning: Transformer models not loaded. Using fallback features.")
            self.tokenizer = None
            self.text_model = None

    def extract_image_features(self, image_path):
        try:
            if not os.path.exists(image_path):
                return np.zeros(2048)
            img = image.load_img(image_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            features = self.image_model.predict(img_array, verbose=0)
            return features.flatten()
        except:
            return np.zeros(2048)

    def extract_text_features(self, text):
        if text is None or text == "":
            return np.zeros(768)
        try:
            if self.tokenizer and self.text_model:
                inputs = self.tokenizer(text, return_tensors='tf', truncation=True, padding=True, max_length=128)
                outputs = self.text_model(**inputs)
                return tf.reduce_mean(outputs.last_hidden_state, axis=1).numpy().flatten()
            else:
                features = np.zeros(768)
                features[0] = len(text)
                features[1] = len(text.split())
                return features
        except:
            return np.zeros(768)

    def load_local_dataset(self, csv_path, images_dir):
        try:
            df = pd.read_csv(csv_path, on_bad_lines='skip')
            df['image_path'] = df['id'].apply(lambda x: os.path.join(images_dir, f"{x}.jpg"))
            print(f"Loaded {len(df)} records from {csv_path}")
            return df
        except:
            print("Failed to load CSV. Using sample dataset.")
            return self.create_sample_dataset()

    # Product domain: 'Fashion' or 'Electronics' (used for price bounds)
    ELECTRONICS_ARTICLE_TYPES = {'Phone', 'Laptop', 'Tablet', 'Headphones', 'Camera', 'TV', 'Accessories', 'Monitor', 'Speaker'}
    FASHION_ARTICLE_TYPES = {'Shirts', 'Tshirts', 'Jeans', 'Tops', 'Dresses', 'Sweaters', 'Jackets', 'Pants', 'Skirt', 'Shorts', 'Shoes', 'Other'}

    def _is_electronics(self, article_type):
        if article_type is None:
            return False
        return str(article_type).strip() in self.ELECTRONICS_ARTICLE_TYPES

    def create_sample_dataset(self):
        np.random.seed(42)
        n_fashion, n_electronics = 400, 100
        n_samples = n_fashion + n_electronics
        categories_fashion = ['Shirts', 'Tshirts', 'Jeans', 'Tops', 'Dresses', 'Sweaters', 'Jackets']
        categories_electronics = ['Phone', 'Laptop', 'Tablet', 'Headphones', 'Camera', 'TV', 'Accessories']
        sub_fashion = ['Topwear', 'Bottomwear', 'Outerwear']
        sub_electronics = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Display']
        colors = ['Black', 'White', 'Blue', 'Red', 'Green']
        seasons = ['Summer', 'Winter', 'Spring']
        article_types = list(np.random.choice(categories_fashion, n_fashion)) + list(np.random.choice(categories_electronics, n_electronics))
        sub_cats = list(np.random.choice(sub_fashion, n_fashion)) + list(np.random.choice(sub_electronics, n_electronics))
        genders = list(np.random.choice(['Men', 'Women'], n_fashion)) + ['Unisex'] * n_electronics
        data = {
            'id': range(1, n_samples + 1),
            'gender': genders,
            'articleType': article_types,
            'subCategory': sub_cats,
            'baseColour': list(np.random.choice(colors, n_fashion)) + ['Black'] * n_electronics,
            'season': list(np.random.choice(seasons, n_fashion)) + ['All Season'] * n_electronics,
            'productDisplayName': [f'Fashion Product {i}' if i <= n_fashion else f'Electronics Product {i}' for i in range(1, n_samples + 1)],
            'price': list(np.random.uniform(15, 150, n_fashion)) + list(np.random.uniform(500, 50000, n_electronics))
        }
        df = pd.DataFrame(data)
        multipliers_f = {'Shirts':1.3,'Tshirts':1.0,'Jeans':1.6,'Tops':1.2,'Dresses':1.8,'Sweaters':1.5,'Jackets':2.0}
        multipliers_e = {'Phone':8000,'Laptop':45000,'Tablet':25000,'Headphones':3000,'Camera':20000,'TV':35000,'Accessories':1500}
        for cat, mul in multipliers_f.items():
            df.loc[df['articleType']==cat,'price'] *= mul
        for cat, mul in multipliers_e.items():
            df.loc[df['articleType']==cat,'price'] *= mul
        df['image_path'] = 'sample_image.jpg'
        return df

    def extract_structured_features(self, row):
        features = []
        categorical_features = ['articleType','gender','subCategory','baseColour','season']
        for feature in categorical_features:
            if feature not in self.label_encoders:
                self.label_encoders[feature] = LabelEncoder()
                self.label_encoders[feature].fit([str(row.get(feature,'Unknown'))])
            try:
                encoded = self.label_encoders[feature].transform([str(row.get(feature,'Unknown'))])[0]
            except:
                encoded = 0
            features.append(encoded)
        
        # Enhanced condition encoding with more granular values
        condition_map = {'Excellent': 5, 'Good': 4, 'Fair': 3, 'Poor': 2, 'Like New': 5, 'New': 6}
        condition = row.get('condition', 'Good')
        condition_value = condition_map.get(condition, 4)  # Default to 'Good'
        
        # Extract more features from product name/description
        product_name = str(row.get('productDisplayName', ''))
        name_length = len(product_name)
        word_count = len(product_name.split())
        
        # Check for premium keywords
        premium_keywords = ['premium', 'luxury', 'pro', 'max', 'ultra', 'plus']
        has_premium = int(any(kw in product_name.lower() for kw in premium_keywords))
        
        # Check for brand indicators (for electronics)
        brand_keywords = ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'iphone', 'macbook']
        has_brand = int(any(kw in product_name.lower() for kw in brand_keywords))
        
        features.extend([
            name_length,
            word_count,
            condition_value,
            has_premium,
            has_brand,
            np.random.randint(0,2),  # Placeholder for bestseller
            np.random.randint(1,6),  # Placeholder for rating
        ])
        return np.array(features)

    def extract_all_features(self, df, sample_size=None):
        if sample_size:
            df = df.sample(min(sample_size,len(df)))
        all_features = []
        valid_indices = []
        print("   Extracting features...")
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
            img_features = self.extract_image_features(row['image_path'])
            text_features = self.extract_text_features(row.get('productDisplayName',''))
            struct_features = self.extract_structured_features(row)
            combined = np.concatenate([img_features, text_features, struct_features])
            all_features.append(combined)
            valid_indices.append(idx)
        return np.array(all_features), df.loc[valid_indices]

    def train_model(self, df, sample_size=1000):
        print(f"\n{'='*60}")
        print("🚀 TRAINING ML PRICE PREDICTION MODEL")
        print(f"{'='*60}\n")
        
        X, df_proc = self.extract_all_features(df, sample_size)
        y = df_proc['price'].values
        
        print(f"📊 Dataset Information:")
        print(f"   Total samples: {len(X)}")
        print(f"   Feature dimension: {X.shape[1]}")
        print(f"   Price range: ${y.min():.2f} - ${y.max():.2f}")
        print(f"   Mean price: ${y.mean():.2f}\n")
        
        X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)
        print(f"🔀 Train/Test Split:")
        print(f"   Training samples: {len(X_train)}")
        print(f"   Testing samples: {len(X_test)}\n")
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Enhanced model parameters for better accuracy
        self.model = RandomForestRegressor(
            n_estimators=300,      # Increased for better ensemble
            max_depth=20,          # Deeper trees for complex patterns
            min_samples_split=2,   # Allow more granular splits
            min_samples_leaf=1,    # More detailed leaf nodes
            max_features='sqrt',   # Optimal feature selection
            bootstrap=True,
            oob_score=True,        # Out-of-bag score for validation
            random_state=42,
            n_jobs=-1,
            verbose=0
        )
        
        print("🧠 Training Enhanced Random Forest Regressor...")
        print(f"   Estimators: 300")
        print(f"   Max depth: 20")
        print(f"   Max features: sqrt")
        self.model.fit(X_train_scaled, y_train)
        print("✅ Training completed!")
        
        # Show OOB score if available
        if hasattr(self.model, 'oob_score_'):
            print(f"   Out-of-Bag R² Score: {self.model.oob_score_:.4f}\n")
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        accuracy = max(0, r2 * 100)  # Convert R2 to percentage
        
        # Cross-validation
        print("🔄 Performing Cross-Validation (5-fold)...")
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5, scoring='r2')
        cv_mean = cv_scores.mean()
        cv_std = cv_scores.std()
        
        # Display comprehensive metrics
        print(f"\n{'='*60}")
        print("📈 MODEL PERFORMANCE METRICS")
        print(f"{'='*60}")
        print(f"\n📊 Test Set Performance:")
        print(f"   Mean Absolute Error (MAE):  ${mae:.2f}")
        print(f"   Root Mean Squared Error:     ${rmse:.2f}")
        print(f"   R² Score:                    {r2:.4f}")
        print(f"   Accuracy:                    {accuracy:.2f}%")
        print(f"\n🔄 Cross-Validation (5-fold):")
        print(f"   Mean R² Score:               {cv_mean:.4f}")
        print(f"   Std Deviation:               {cv_std:.4f}")
        print(f"   CV Accuracy:                 {cv_mean*100:.2f}%")
        print(f"\n{'='*60}\n")
        
        return self.model, X_test, y_test, y_pred

    def predict_price(self, image_path, product_type, description, additional_features=None):
        if self.model is None:
            raise ValueError("Model not trained yet")
        img_features = self.extract_image_features(image_path)
        text_features = self.extract_text_features(f"{product_type}. {description}")
        row = {
            'articleType': product_type,
            'gender': additional_features.get('gender','Unisex') if additional_features else 'Unisex',
            'subCategory': additional_features.get('sub_category','Topwear') if additional_features else 'Topwear',
            'baseColour': additional_features.get('color','Black') if additional_features else 'Black',
            'season': additional_features.get('season','All Season') if additional_features else 'All Season',
            'condition': additional_features.get('condition','Good') if additional_features else 'Good',
            'productDisplayName': description
        }
        struct_features = self.extract_structured_features(row)
        combined = np.concatenate([img_features, text_features, struct_features]).reshape(1,-1)
        combined_scaled = self.scaler.transform(combined)
        price = self.model.predict(combined_scaled)[0]
        
        # Determine if electronics based on explicit flag or product type
        is_electronics = False
        if additional_features and 'product_domain' in additional_features:
             is_electronics = additional_features['product_domain'] == 'Electronics'
        else:
             is_electronics = self._is_electronics(product_type)

        print(f"   Raw Predicted Price: {price}, Is Electronics: {is_electronics}")

        # Apply domain-specific scaling and clamping
        if is_electronics:
            # Electronics need better scaling - apply multiplier based on keywords
            description_lower = description.lower()
            
            # Base multiplier for electronics
            multiplier = 5.0
            
            # Adjust based on product type
            if 'laptop' in description_lower or product_type == 'Laptops':
                multiplier = 15.0
            elif 'phone' in description_lower or 'smartphone' in description_lower or product_type == 'Phones':
                multiplier = 6.5
            elif 'tablet' in description_lower or product_type == 'Tablets':
                multiplier = 8.0
            elif 'camera' in description_lower or product_type == 'Camera':
                multiplier = 10.0
            elif 'tv' in description_lower or product_type == 'TV':
                multiplier = 15.0
            
            # Adjust for brand keywords
            if any(brand in description_lower for brand in ['apple', 'iphone', 'macbook', 'ipad']):
                multiplier *= 1.4
            elif any(brand in description_lower for brand in ['samsung', 'oneplus']):
                multiplier *= 1.1
            elif any(brand in description_lower for brand in ['dell', 'hp', 'lenovo', 'acer']):
                multiplier *= 1.0
            elif any(brand in description_lower for brand in ['redmi', 'oppo', 'vivo']):
                multiplier *= 0.8
            
            # Adjust for storage/RAM indicators
            if any(spec in description_lower for spec in ['256gb', '512gb', '1tb', '16gb ram']):
                multiplier *= 1.2
            elif any(spec in description_lower for spec in ['128gb', '8gb ram']):
                multiplier *= 1.0
            elif any(spec in description_lower for spec in ['64gb', '4gb ram']):
                multiplier *= 0.85
            
            # Apply condition adjustment
            condition = additional_features.get('condition', 'Good') if additional_features else 'Good'
            condition_multipliers = {'Excellent': 1.15, 'Good': 1.0, 'Fair': 0.75, 'Poor': 0.50}
            multiplier *= condition_multipliers.get(condition, 1.0)
            
            price = price * multiplier
            return max(1000, min(100000, price))
        
        # Fashion products
        return max(50, min(1500, price))

    def save_model(self, filepath='multimodal_price_predictor.pkl'):
        model_data = {'model':self.model,'scaler':self.scaler,'label_encoders':self.label_encoders}
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath='multimodal_price_predictor.pkl'):
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoders = model_data['label_encoders']
        print(f"Model loaded from {filepath}")
