import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tqdm import tqdm
import joblib
import os

# =====================================
# 1️⃣ Load and Prepare Dataset
# =====================================
print("📂 Loading dataset...")
data = pd.read_csv("cleaned_images.csv")

# Fix image paths
data['image_path'] = data['image_path'].apply(lambda x: x if x.startswith("images/") else f"images/{x}")
data['image_path'] = data['image_path'].apply(lambda x: x if x.endswith(".jpg") else f"{x}.jpg")

# Clean price column
data['price'] = data['price'].replace('[₹,]', '', regex=True).astype(float)

# Combine text fields
data['text_data'] = data['description'].astype(str) + " " + data['Product'].astype(str)

# Show dataset info
print(f"🖼 Total images in dataset: {len(data)}")
print(f"💰 Price range: ₹{data['price'].min():.2f} - ₹{data['price'].max():.2f}")

# =====================================
# 2️⃣ Extract Text Features
# =====================================
print("\n🔤 Extracting TF-IDF text features...")
tfidf = TfidfVectorizer(max_features=5000)
text_features = tfidf.fit_transform(data['text_data']).toarray()
print(f"✅ Text features shape: {text_features.shape}")

# =====================================
# 3️⃣ Extract Image Features using MobileNetV2
# =====================================
print("\n🧠 Loading MobileNetV2 model...")
mobilenet = MobileNetV2(weights="imagenet", include_top=False, pooling="avg")

loaded_count = 0
failed_images = []

def extract_image_feature(img_path):
    global loaded_count
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        features = mobilenet.predict(x, verbose=0)
        loaded_count += 1
        return features.flatten()
    except Exception as e:
        failed_images.append(img_path)
        return np.zeros((1280,))

print("\n🖼 Extracting image features (this may take a few minutes)...")
image_features = np.array([extract_image_feature(img) for img in tqdm(data['image_path'], desc="Processing Images")])

print(f"\n✅ Successfully loaded images: {loaded_count}")
print(f"❌ Failed images: {len(failed_images)}")

# Optionally, save failed image paths
if failed_images:
    pd.Series(failed_images).to_csv("failed_images.csv", index=False)
    print("⚠ Failed image paths saved to failed_images.csv")

# =====================================
# 4️⃣ Combine Text + Image Features
# =====================================
combined_features = np.concatenate([text_features, image_features], axis=1)
print(f"🧩 Combined feature shape: {combined_features.shape}")

# =====================================
# 5️⃣ Split Dataset
# =====================================
X_train, X_test, y_train, y_test = train_test_split(combined_features, data['price'], test_size=0.2, random_state=42)
print(f"\n📊 Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

# =====================================
# 6️⃣ Train Random Forest Model
# =====================================
print(f"\n{'='*60}")
print("🚀 TRAINING RANDOMFOREST REGRESSOR MODEL")
print(f"{'='*60}")
print("\n🧠 Model Configuration:")
print("   Algorithm: Random Forest Regressor")
print("   Estimators: 300")
print("   Max Depth: 20")
print("   Min Samples Split: 3")
print("\n⏳ Training in progress...")

model = RandomForestRegressor(
    n_estimators=300,  # Increased for better accuracy
    max_depth=20,
    min_samples_split=3,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)
print("✅ Training completed!\n")

# =====================================
# 7️⃣ Evaluate Model
# =====================================
print(f"{'='*60}")
print("📈 EVALUATING MODEL PERFORMANCE")
print(f"{'='*60}\n")

# Test set predictions
y_pred = model.predict(X_test)

# Calculate metrics
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)
accuracy = max(0, r2 * 100)

# Cross-validation
print("🔄 Performing 5-Fold Cross-Validation...")
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2', n_jobs=-1)
cv_mean = cv_scores.mean()
cv_std = cv_scores.std()

# Display comprehensive results
print(f"\n{'='*60}")
print("📊 MODEL PERFORMANCE METRICS")
print(f"{'='*60}")
print("\n📈 Test Set Performance:")
print(f"   Mean Absolute Error (MAE):     ₹{mae:.2f}")
print(f"   Root Mean Squared Error (RMSE): ₹{rmse:.2f}")
print(f"   R² Score:                       {r2:.4f}")
print(f"   Accuracy:                       {accuracy:.2f}%")
print(f"\n🔄 Cross-Validation Results (5-fold):")
print(f"   Mean R² Score:                  {cv_mean:.4f}")
print(f"   Standard Deviation:             {cv_std:.4f}")
print(f"   CV Accuracy:                    {cv_mean*100:.2f}%")
print(f"\n{'='*60}\n")

# =====================================
# 8️⃣ Save Model and Vectorizer
# =====================================
joblib.dump(model, "price_model.pkl")
joblib.dump(tfidf, "tfidf_vectorizer.pkl")

print("💾 Model and vectorizer saved successfully.")
print("🏁 Training complete.")
print(f"🖼 Total images trained on: {loaded_count}/{len(data)}")
print(f"\n🎯 Final Model Accuracy: {accuracy:.2f}%")