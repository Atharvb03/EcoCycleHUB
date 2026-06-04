"""
CLI prediction script — calls the loaded models directly.
Usage: python predict.py <name> <description> <category> <subCategory> [condition] [rating] [review_count]
"""

import sys
import json
import os
import numpy as np
import joblib
import re

ELECTRONICS_MODEL_PATH = os.path.join(os.path.dirname(__file__), "electronics_price_model.pkl")
FASHION_MODEL_PATH = os.path.join(os.path.dirname(__file__), "fashion_price_model.pkl")

CONDITION_MULTIPLIERS = {
    "New": 1.0, "Like New": 0.90, "Excellent": 0.80,
    "Good": 0.65, "Fair": 0.45, "Poor": 0.30,
}

def extract_category_elec(name):
    name_lower = str(name).lower()
    if any(k in name_lower for k in ["iphone","galaxy","smartphone","phone","narzo","nord","iqoo","redmi","poco"]):
        return "smartphone"
    elif any(k in name_lower for k in ["laptop","macbook","notebook"]):
        return "laptop"
    elif any(k in name_lower for k in ["tablet","ipad"]):
        return "tablet"
    elif any(k in name_lower for k in ["earbuds","earphones","headphone","neckband","tws","buds"]):
        return "audio"
    elif any(k in name_lower for k in ["tv ","television","smart tv"]):
        return "tv"
    elif any(k in name_lower for k in ["camera","dslr"]):
        return "camera"
    elif any(k in name_lower for k in ["watch","smartwatch"]):
        return "wearable"
    elif any(k in name_lower for k in ["charger","adapter","cable","power bank"]):
        return "accessory"
    elif any(k in name_lower for k in ["speaker","soundbar"]):
        return "speaker"
    return "other"

def extract_brand_elec(name):
    name_lower = str(name).lower()
    brands = ["apple","samsung","oneplus","realme","redmi","xiaomi","oppo","vivo",
              "iqoo","poco","motorola","nokia","sony","lg","dell","hp","lenovo",
              "asus","acer","boat","jbl","bose","canon","nikon"]
    for b in brands:
        if b in name_lower:
            return b
    return "other"

def extract_storage(name):
    match = re.search(r'(\d+)\s*(?:gb|tb)', str(name).lower())
    if match:
        val = int(match.group(1))
        if "tb" in str(name).lower()[match.start():match.end()]:
            val *= 1024
        return min(val, 2048)
    return 0

def extract_ram(name):
    match = re.search(r'(\d+)\s*gb\s*(?:ram|lpddr)', str(name).lower())
    return min(int(match.group(1)), 64) if match else 0

def predict_electronics(name, rating, review_count, bundle):
    tfidf = bundle["tfidf"]
    structured_cols = bundle["structured_cols"]
    tfidf_vec = tfidf.transform([name]).toarray()
    cat = extract_category_elec(name)
    brand = extract_brand_elec(name)
    row = {
        "storage_gb": extract_storage(name),
        "ram_gb": extract_ram(name),
        "is_5g": int("5g" in name.lower()),
        "is_pro": int(any(k in name.lower() for k in ["pro","ultra","max","plus"])),
        "name_length": len(name),
        "word_count": len(name.split()),
        "rating": rating,
        "log_review_count": np.log1p(review_count),
    }
    for col in structured_cols:
        if col.startswith("category_"):
            row[col] = int(col == f"category_{cat}")
        elif col.startswith("brand_"):
            row[col] = int(col == f"brand_{brand}")
    struct_vec = np.array([row.get(c, 0) for c in structured_cols]).reshape(1, -1)
    features = np.concatenate([tfidf_vec, struct_vec], axis=1)
    return float(bundle["model"].predict(features)[0])

def predict_fashion(product, description, bundle):
    tfidf = bundle["tfidf"]
    structured_cols = bundle["structured_cols"]
    tfidf_vec = tfidf.transform([description]).toarray()
    colors = ["red","blue","green","black","white","pink","grey","gray","yellow","orange","purple","brown","beige","navy","maroon"]
    materials = ["cotton","silk","linen","velvet","polyester","wool","denim","leather","nylon","rayon","chiffon","satin"]
    cats = ["T-Shirt","Shirt","Pants","Shoes","Dress","Outwear","Longsleeve","Shorts","Hat","Skirt","Jacket","Sweater","Jeans","Top","Coat","Hoodie"]
    color = next((c for c in colors if c in description.lower()), "other")
    material = next((m for m in materials if m in description.lower()), "other")
    product_norm = next((c for c in cats if c.lower() in product.lower()), "Other")
    row = {
        "is_premium": int(any(k in description.lower() for k in ["premium","luxury","designer","exclusive"])),
        "desc_length": len(description),
        "desc_words": len(description.split()),
    }
    for col in structured_cols:
        if col.startswith("product_norm_"):
            row[col] = int(col == f"product_norm_{product_norm}")
        elif col.startswith("color_"):
            row[col] = int(col == f"color_{color}")
        elif col.startswith("material_"):
            row[col] = int(col == f"material_{material}")
    struct_vec = np.array([row.get(c, 0) for c in structured_cols]).reshape(1, -1)
    features = np.concatenate([tfidf_vec, struct_vec], axis=1)
    return float(bundle["model"].predict(features)[0])

def main():
    try:
        name        = sys.argv[1] if len(sys.argv) > 1 else ""
        description = sys.argv[2] if len(sys.argv) > 2 else ""
        category    = sys.argv[3] if len(sys.argv) > 3 else "Fashion"
        subCategory = sys.argv[4] if len(sys.argv) > 4 else ""
        condition   = sys.argv[5] if len(sys.argv) > 5 else "Good"
        rating      = float(sys.argv[6]) if len(sys.argv) > 6 else 4.0
        review_count = int(sys.argv[7]) if len(sys.argv) > 7 else 100

        is_electronics = category.strip().lower() == "electronics"

        if is_electronics:
            if not os.path.exists(ELECTRONICS_MODEL_PATH):
                print(json.dumps({"error": "Electronics model not found. Run train_electronics.py first."}))
                sys.exit(1)
            bundle = joblib.load(ELECTRONICS_MODEL_PATH)
            full_name = f"{subCategory} {name}".strip()
            raw_price = predict_electronics(full_name, rating, review_count, bundle)
            raw_price = max(100.0, raw_price)
        else:
            if not os.path.exists(FASHION_MODEL_PATH):
                print(json.dumps({"error": "Fashion model not found. Run train_fashion.py first."}))
                sys.exit(1)
            bundle = joblib.load(FASHION_MODEL_PATH)
            product = subCategory if subCategory else name
            desc = description if description else f"{product} {name}"
            raw_price = predict_fashion(product, desc, bundle)
            raw_price = max(50.0, raw_price)

        multiplier = CONDITION_MULTIPLIERS.get(condition, 0.65)
        final_price = raw_price * multiplier

        if is_electronics:
            final_price = max(100.0, min(150000.0, final_price))
        else:
            final_price = max(50.0, min(5000.0, final_price))

        print(json.dumps({"predicted_price": f"{final_price:.2f}"}))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
