"""
Electronics Price Prediction Model
Dataset: amazon_all_electronics_data.csv
Model: XGBoost Regressor with TF-IDF + structured features
"""

import pandas as pd
import numpy as np
import re
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# ─────────────────────────────────────────────
# 1. Load Dataset
# ─────────────────────────────────────────────
print("📂 Loading electronics dataset...")
df = pd.read_csv("amazon_all_electronics_data.csv")
print(f"   Raw rows: {len(df)}")

# Drop rows with missing price
df = df.dropna(subset=["Price"])
df = df[df["Price"] > 0]
print(f"   After cleaning: {len(df)} rows")
print(f"   Price range: ₹{df['Price'].min():.0f} – ₹{df['Price'].max():.0f}")

# ─────────────────────────────────────────────
# 2. Feature Engineering
# ─────────────────────────────────────────────
print("\n🔧 Engineering features...")

def extract_category(name):
    """Infer product category from product name keywords."""
    name_lower = str(name).lower()
    if any(k in name_lower for k in ["iphone", "galaxy", "smartphone", "mobile", "phone", "narzo", "nord", "iqoo", "redmi", "poco"]):
        return "smartphone"
    elif any(k in name_lower for k in ["laptop", "macbook", "notebook", "chromebook"]):
        return "laptop"
    elif any(k in name_lower for k in ["tablet", "ipad", "tab "]):
        return "tablet"
    elif any(k in name_lower for k in ["earbuds", "earphones", "headphone", "neckband", "tws", "earpods", "buds"]):
        return "audio"
    elif any(k in name_lower for k in ["tv ", "television", "smart tv", "oled", "qled"]):
        return "tv"
    elif any(k in name_lower for k in ["camera", "dslr", "mirrorless", "webcam"]):
        return "camera"
    elif any(k in name_lower for k in ["watch", "smartwatch", "band "]):
        return "wearable"
    elif any(k in name_lower for k in ["charger", "adapter", "cable", "power bank", "powerbank"]):
        return "accessory"
    elif any(k in name_lower for k in ["speaker", "soundbar", "subwoofer"]):
        return "speaker"
    elif any(k in name_lower for k in ["printer", "scanner", "monitor", "display"]):
        return "computer_peripheral"
    else:
        return "other"

def extract_brand(name):
    """Extract brand from product name."""
    name_lower = str(name).lower()
    brands = {
        "apple": "apple", "samsung": "samsung", "oneplus": "oneplus",
        "realme": "realme", "redmi": "redmi", "xiaomi": "xiaomi",
        "oppo": "oppo", "vivo": "vivo", "iqoo": "iqoo", "poco": "poco",
        "motorola": "motorola", "nokia": "nokia", "sony": "sony",
        "lg": "lg", "dell": "dell", "hp": "hp", "lenovo": "lenovo",
        "asus": "asus", "acer": "acer", "msi": "msi", "boat": "boat",
        "jbl": "jbl", "bose": "bose", "sennheiser": "sennheiser",
        "tapo": "tapo", "tp-link": "tp-link", "logitech": "logitech",
        "canon": "canon", "nikon": "nikon", "fujifilm": "fujifilm",
    }
    for key, val in brands.items():
        if key in name_lower:
            return val
    return "other"

def extract_storage(name):
    """Extract storage GB from product name."""
    match = re.search(r'(\d+)\s*(?:gb|tb)\s*(?:storage|rom|ssd|hdd)?', str(name).lower())
    if match:
        val = int(match.group(1))
        # Convert TB to GB
        if "tb" in str(name).lower()[match.start():match.end()]:
            val *= 1024
        return min(val, 2048)  # cap at 2TB
    return 0

def extract_ram(name):
    """Extract RAM GB from product name."""
    match = re.search(r'(\d+)\s*gb\s*(?:ram|lpddr)', str(name).lower())
    if match:
        return min(int(match.group(1)), 64)
    return 0

def has_keyword(name, keywords):
    name_lower = str(name).lower()
    return int(any(k in name_lower for k in keywords))

# Apply feature extraction
df["category"] = df["Product_Name"].apply(extract_category)
df["brand"] = df["Product_Name"].apply(extract_brand)
df["storage_gb"] = df["Product_Name"].apply(extract_storage)
df["ram_gb"] = df["Product_Name"].apply(extract_ram)
df["is_5g"] = df["Product_Name"].apply(lambda x: has_keyword(x, ["5g"]))
df["is_pro"] = df["Product_Name"].apply(lambda x: has_keyword(x, ["pro", "ultra", "max", "plus"]))
df["name_length"] = df["Product_Name"].apply(lambda x: len(str(x)))
df["word_count"] = df["Product_Name"].apply(lambda x: len(str(x).split()))
df["rating"] = df["Rating"].fillna(df["Rating"].median())
df["review_count"] = df["Review_Count"].fillna(0)
df["log_review_count"] = np.log1p(df["review_count"])

# One-hot encode category and brand
df = pd.get_dummies(df, columns=["category", "brand"], drop_first=False)

print(f"   Features engineered. Dataset shape: {df.shape}")

# ─────────────────────────────────────────────
# 3. TF-IDF on Product Name
# ─────────────────────────────────────────────
print("\n🔤 Extracting TF-IDF features from product names...")
tfidf = TfidfVectorizer(max_features=300, ngram_range=(1, 2), sublinear_tf=True)
tfidf_matrix = tfidf.fit_transform(df["Product_Name"].fillna("")).toarray()
print(f"   TF-IDF shape: {tfidf_matrix.shape}")

# ─────────────────────────────────────────────
# 4. Assemble Feature Matrix
# ─────────────────────────────────────────────
structured_cols = [
    "storage_gb", "ram_gb", "is_5g", "is_pro",
    "name_length", "word_count", "rating", "log_review_count"
] + [c for c in df.columns if c.startswith("category_") or c.startswith("brand_")]

X_structured = df[structured_cols].values
X = np.concatenate([tfidf_matrix, X_structured], axis=1)
y = df["Price"].values

print(f"\n📊 Final feature matrix: {X.shape}")
print(f"   Price range: ₹{y.min():.0f} – ₹{y.max():.0f}")
print(f"   Mean price: ₹{y.mean():.0f}")

# ─────────────────────────────────────────────
# 5. Train / Test Split
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\n🔀 Train: {len(X_train)} | Test: {len(X_test)}")

# ─────────────────────────────────────────────
# 6. Train XGBoost Model
# ─────────────────────────────────────────────
print("\n🚀 Training XGBoost Regressor...")
model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    verbosity=1,
)

model.fit(X_train, y_train)
print("✅ Training complete!")

# ─────────────────────────────────────────────
# 7. Evaluate
# ─────────────────────────────────────────────
y_pred = model.predict(X_test)
y_pred = np.clip(y_pred, 0, None)  # no negative prices

mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2   = r2_score(y_test, y_pred)

# MAPE (mean absolute percentage error)
mask = y_test > 0
mape = np.mean(np.abs((y_test[mask] - y_pred[mask]) / y_test[mask])) * 100

print(f"\n{'='*55}")
print("📈 ELECTRONICS MODEL PERFORMANCE")
print(f"{'='*55}")
print(f"   R² Score  : {r2:.4f}  ({r2*100:.1f}%)")
print(f"   MAE       : ₹{mae:.0f}")
print(f"   RMSE      : ₹{rmse:.0f}")
print(f"   MAPE      : {mape:.1f}%")
print(f"{'='*55}\n")

# ─────────────────────────────────────────────
# 8. Save Model + Vectorizer + Feature Columns
# ─────────────────────────────────────────────
joblib.dump({
    "model": model,
    "tfidf": tfidf,
    "structured_cols": structured_cols,
    "feature_stats": {
        "price_min": float(y.min()),
        "price_max": float(y.max()),
        "price_mean": float(y.mean()),
    }
}, "electronics_price_model.pkl")

print("💾 Saved: electronics_price_model.pkl")
print(f"🎯 Final R²: {r2*100:.1f}% | MAE: ₹{mae:.0f} | MAPE: {mape:.1f}%")
