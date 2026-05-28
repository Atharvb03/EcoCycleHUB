import pandas as pd
import numpy as np
import os
from ml_model import MultiModalPricePredictor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

# Electronics product types
ELECTRONICS_PRODUCTS = {'Phone', 'Laptop', 'Tablet', 'Headphones', 'Camera', 'TV', 'Accessories', 'Monitor', 'Speaker'}

def clean_price(price_str):
    """Clean price string and convert to float"""
    if isinstance(price_str, (int, float)):
        return float(price_str)
    # Remove currency symbols and commas
    cleaned = str(price_str).replace('₹', '').replace('â‚¹', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except:
        return None

def normalize_df_for_training(df):
    """Ensure dataframe has columns expected by MultiModalPricePredictor."""
    df = df.copy()
    
    # Clean price column
    if 'price' in df.columns:
        df['price'] = df['price'].apply(clean_price)
        df = df.dropna(subset=['price'])
        df = df[df['price'] > 0]
    
    # Map Product to articleType
    if 'Product' in df.columns and 'articleType' not in df.columns:
        df['articleType'] = df['Product']
    
    # Map description to productDisplayName
    if 'description' in df.columns and 'productDisplayName' not in df.columns:
        df['productDisplayName'] = df['description']
    
    # Set defaults for missing columns
    for col, default in [('gender', 'Unisex'), ('subCategory', 'Topwear'), 
                         ('baseColour', 'Black'), ('season', 'All Season'), 
                         ('condition', 'Good')]:
        if col not in df.columns:
            df[col] = default
    
    # For electronics products, set subCategory from Product
    product_to_sub = {
        'Phone': 'Phones', 'Laptop': 'Laptops', 'Tablet': 'Tablets',
        'Headphones': 'Audio', 'Camera': 'Accessories', 'TV': 'Display',
        'Accessories': 'Accessories', 'Monitor': 'Display', 'Speaker': 'Audio'
    }
    
    if 'articleType' in df.columns:
        for p, sub in product_to_sub.items():
            mask = df['articleType'].astype(str).str.strip() == p
            df.loc[mask, 'subCategory'] = sub
            df.loc[mask, 'gender'] = 'Unisex'
    
    return df

def load_and_merge_datasets():
    """Load cleaned_images.csv and electronics_images.csv, then merge and normalize."""
    dfs = []
    
    # 1) Fashion dataset
    csv_path = "cleaned_images.csv"
    if os.path.exists(csv_path):
        print(f"📂 Loading {csv_path}...")
        df = pd.read_csv(csv_path)
        df['image_path'] = df['image_path'].apply(
            lambda x: x if str(x).startswith("images/") else f"images/{x}"
        )
        dfs.append(df)
        print(f"   Loaded {len(df)} fashion items")
    
    # 2) Electronics dataset
    electronics_path = "electronics_images.csv"
    if os.path.exists(electronics_path):
        print(f"📂 Loading {electronics_path}...")
        df_e = pd.read_csv(electronics_path)
        df_e['image_path'] = df_e['image_path'].apply(
            lambda x: x if str(x).startswith("images/") else f"images/{x}"
        )
        dfs.append(df_e)
        print(f"   Loaded {len(df_e)} electronics items")
    
    if not dfs:
        return None
    
    df = pd.concat(dfs, ignore_index=True)
    df = normalize_df_for_training(df)
    
    print(f"\n📊 Combined Dataset:")
    print(f"   Total samples: {len(df)}")
    print(f"   Price range: ₹{df['price'].min():.2f} - ₹{df['price'].max():.2f}")
    print(f"   Mean price: ₹{df['price'].mean():.2f}")
    print(f"   Median price: ₹{df['price'].median():.2f}")
    
    return df

def augment_with_conditions(df):
    """Augment dataset with different conditions and realistic price adjustments"""
    print("\n✨ Augmenting data with condition variations...")
    
    augmented_rows = []
    conditions = ['Excellent', 'Good', 'Fair', 'Poor']
    
    # More realistic condition multipliers
    multipliers = {
        'Excellent': 1.15,  # 15% premium for excellent condition
        'Good': 1.0,        # Base price
        'Fair': 0.75,       # 25% discount for fair condition
        'Poor': 0.50        # 50% discount for poor condition
    }
    
    for idx, row in df.iterrows():
        # Add original with 'Good' condition
        original = row.copy()
        original['condition'] = 'Good'
        augmented_rows.append(original)
        
        # Add 2-3 variations with different conditions
        num_variations = np.random.randint(2, 4)
        selected_conditions = np.random.choice(
            [c for c in conditions if c != 'Good'], 
            size=min(num_variations, 3), 
            replace=False
        )
        
        for cond in selected_conditions:
            new_row = row.copy()
            new_row['condition'] = cond
            new_row['price'] = row['price'] * multipliers[cond]
            augmented_rows.append(new_row)
    
    augmented_df = pd.DataFrame(augmented_rows)
    augmented_df = augmented_df.reset_index(drop=True)
    
    print(f"   Original samples: {len(df)}")
    print(f"   Augmented samples: {len(augmented_df)}")
    print(f"   Augmentation factor: {len(augmented_df) / len(df):.2f}x")
    
    return augmented_df

def train_and_save():
    print(f"\n{'='*70}")
    print("🚀 ENHANCED MODEL TRAINING (FASHION + ELECTRONICS)")
    print(f"{'='*70}\n")

    # 1. Initialize Predictor
    predictor = MultiModalPricePredictor()
    
    # 2. Load Data
    df = load_and_merge_datasets()
    if df is None or len(df) == 0:
        print("❌ Error: No data found. Add cleaned_images.csv to ml_model folder.")
        return
    
    # 3. Augment Data with Conditions
    augmented_df = augment_with_conditions(df)
    
    # 4. Train Model with larger sample size
    print("\n🧠 Training Enhanced Model...")
    print("   Using improved RandomForest with optimized hyperparameters")
    
    # Use more samples for better accuracy
    sample_size = min(8000, len(augmented_df))
    model, X_test, y_test, y_pred = predictor.train_model(
        augmented_df, 
        sample_size=sample_size
    )
    
    # 5. Additional Evaluation
    print(f"\n{'='*70}")
    print("📊 DETAILED PERFORMANCE ANALYSIS")
    print(f"{'='*70}\n")
    
    # Calculate percentage errors
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    print(f"📈 Additional Metrics:")
    print(f"   Mean Absolute Percentage Error: {mape:.2f}%")
    print(f"   Median Absolute Error: ₹{np.median(np.abs(y_test - y_pred)):.2f}")
    
    # Show sample predictions
    print(f"\n🔍 Sample Predictions (first 10):")
    print(f"{'Actual':>12} {'Predicted':>12} {'Error':>12} {'Error %':>12}")
    print("-" * 50)
    for i in range(min(10, len(y_test))):
        actual = y_test.iloc[i] if hasattr(y_test, 'iloc') else y_test[i]
        predicted = y_pred[i]
        error = actual - predicted
        error_pct = (error / actual) * 100
        print(f"₹{actual:>10.2f} ₹{predicted:>10.2f} ₹{error:>10.2f} {error_pct:>10.2f}%")
    
    # 6. Save Model
    print(f"\n{'='*70}")
    print("💾 Saving Enhanced Model...")
    predictor.save_model("multimodal_price_predictor.pkl")
    print("✅ Model saved successfully to: multimodal_price_predictor.pkl")
    print(f"{'='*70}\n")
    
    return predictor

if __name__ == "__main__":
    train_and_save()
