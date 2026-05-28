import pandas as pd
import numpy as np
import os
from ml_model import MultiModalPricePredictor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Electronics product types (map Product -> subCategory for training)
ELECTRONICS_PRODUCTS = {'Phone', 'Laptop', 'Tablet', 'Headphones', 'Camera', 'TV', 'Accessories', 'Monitor', 'Speaker'}

def normalize_df_for_training(df):
    """Ensure dataframe has columns expected by MultiModalPricePredictor."""
    df = df.copy()
    if 'Product' in df.columns and 'articleType' not in df.columns:
        df['articleType'] = df['Product']
    if 'description' in df.columns and 'productDisplayName' not in df.columns:
        df['productDisplayName'] = df['description']
    for col, default in [('gender', 'Unisex'), ('subCategory', 'Topwear'), ('baseColour', 'Black'), ('season', 'All Season'), ('condition', 'Good')]:
        if col not in df.columns:
            df[col] = default
    # For electronics products, set subCategory from Product
    product_to_sub = {'Phone': 'Phones', 'Laptop': 'Laptops', 'Tablet': 'Tablets', 'Headphones': 'Audio', 'Camera': 'Accessories', 'TV': 'Display', 'Accessories': 'Accessories', 'Monitor': 'Display', 'Speaker': 'Audio'}
    if 'articleType' in df.columns:
        for p, sub in product_to_sub.items():
            mask = df['articleType'].astype(str).str.strip() == p
            df.loc[mask, 'subCategory'] = sub
    return df

def load_and_merge_datasets():
    """Load cleaned_images.csv and optionally electronics_images.csv, then merge and normalize."""
    dfs = []
    # 1) Fashion / main dataset
    csv_path = "cleaned_images.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        if df['price'].dtype == object:
            df['price'] = df['price'].replace('[₹,]', '', regex=True).astype(float)
        df['image_path'] = df['image_path'].apply(lambda x: x if str(x).startswith("images/") else f"images/{x}")
        dfs.append(df)
    # 2) Electronics dataset (optional)
    electronics_path = "electronics_images.csv"
    if os.path.exists(electronics_path):
        df_e = pd.read_csv(electronics_path)
        if df_e['price'].dtype == object:
            df_e['price'] = df_e['price'].replace('[₹,]', '', regex=True).astype(float)
        df_e['image_path'] = df_e['image_path'].apply(lambda x: x if str(x).startswith("images/") else f"images/{x}")
        dfs.append(df_e)
    if not dfs:
        return None
    df = pd.concat(dfs, ignore_index=True)
    return normalize_df_for_training(df)

def train_and_save():
    print(f"\n{'='*60}")
    print("🚀 STARTING IMPROVED MODEL TRAINING (FASHION + ELECTRONICS)")
    print(f"{'='*60}\n")

    # 1. Initialize Predictor
    predictor = MultiModalPricePredictor()
    
    # 2. Load Data (cleaned_images.csv + optional electronics_images.csv)
    df = load_and_merge_datasets()
    if df is None:
        print("❌ Error: cleaned_images.csv not found. Add it to the ml_model folder.")
        return

    print("📂 Loading dataset...")
    print(f"   Total samples: {len(df)}")
    
    # 3. Augment Data with Conditions
    print("\n✨ Augmenting data with 'condition' feature...")
    augmented_rows = []
    conditions = ['Excellent', 'Good', 'Fair', 'Poor']
    multipliers = {'Excellent': 1.2, 'Good': 1.0, 'Fair': 0.8, 'Poor': 0.6}
    is_electronics = df['articleType'].astype(str).str.strip().isin(ELECTRONICS_PRODUCTS) if 'articleType' in df.columns else pd.Series(False, index=df.index)

    for idx, row in df.iterrows():
        selected_conditions = np.random.choice(conditions, 2, replace=False)
        for cond in selected_conditions:
            new_row = row.copy()
            new_row['condition'] = cond
            new_row['price'] = row['price'] * multipliers[cond]
            augmented_rows.append(new_row)

    augmented_df = pd.DataFrame(augmented_rows)
    augmented_df = augmented_df.reset_index(drop=True)
    print(f"   Augmented dataset size: {len(augmented_df)}")
    print(f"   Price range: ₹{augmented_df['price'].min():.2f} - ₹{augmented_df['price'].max():.2f}")
    
    # 4. Train Model
    print("\n🧠 Training MultiModalPricePredictor...")
    # This uses the train_model method in ml_model.py which I improved earlier
    model, X_test, y_test, y_pred = predictor.train_model(augmented_df, sample_size=5000) 
    
    # 5. Save Model
    print("\n💾 Saving model...")
    predictor.save_model("multimodal_price_predictor.pkl")
    print("✅ Model saved successfully!")

if __name__ == "__main__":
    train_and_save()
