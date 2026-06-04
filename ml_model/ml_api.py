"""
EcoCycleHUB - ML Price Prediction API
Two separate models: electronics + fashion
Falls back to rule-based pricing when ML features are sparse.
"""

from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import re
import os

app = FastAPI(title="EcoCycleHUB Price Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Load models at startup
# ─────────────────────────────────────────────
ELECTRONICS_MODEL_PATH = "electronics_price_model.pkl"
FASHION_MODEL_PATH     = "fashion_price_model.pkl"

electronics_bundle = None
fashion_bundle     = None

def load_models():
    global electronics_bundle, fashion_bundle
    if os.path.exists(ELECTRONICS_MODEL_PATH):
        electronics_bundle = joblib.load(ELECTRONICS_MODEL_PATH)
        print("✅ Electronics model loaded")
    else:
        print(f"⚠️  {ELECTRONICS_MODEL_PATH} not found. Run train_electronics.py first.")
    if os.path.exists(FASHION_MODEL_PATH):
        fashion_bundle = joblib.load(FASHION_MODEL_PATH)
        print("✅ Fashion model loaded")
    else:
        print(f"⚠️  {FASHION_MODEL_PATH} not found. Run train_fashion.py first.")

load_models()

# ─────────────────────────────────────────────
# Condition multipliers
# ─────────────────────────────────────────────
CONDITION_MULTIPLIERS = {
    "New": 1.0, "Like New": 0.90, "Excellent": 0.80,
    "Good": 0.65, "Fair": 0.45, "Poor": 0.30,
}

# ─────────────────────────────────────────────
# Rule-based fallback prices (used when ML
# features are too sparse to trust)
# ─────────────────────────────────────────────
ELECTRONICS_RULE_PRICES = {
    # smartphones
    "iphone": 55000, "macbook": 90000, "ipad": 40000,
    "samsung galaxy s": 60000, "samsung galaxy a": 20000,
    "oneplus": 25000, "pixel": 45000,
    "redmi note": 15000, "redmi": 12000,
    "realme": 13000, "poco": 14000, "iqoo": 18000,
    "vivo": 15000, "oppo": 14000, "motorola": 12000,
    "nokia": 10000,
    # laptops
    "macbook pro": 120000, "macbook air": 80000,
    "dell xps": 80000, "dell": 45000,
    "hp spectre": 75000, "hp": 40000,
    "lenovo thinkpad": 60000, "lenovo": 40000,
    "asus rog": 80000, "asus": 45000,
    "acer": 35000,
    # audio
    "airpods pro": 20000, "airpods": 14000,
    "sony wh": 18000, "bose": 22000,
    "boat": 1500, "jbl": 3000, "sennheiser": 8000,
    "earphone": 800, "earbuds": 1500, "headphone": 2000,
    "neckband": 1000,
    # tablets
    "ipad pro": 80000, "ipad air": 55000, "ipad mini": 40000,
    "samsung tab": 25000, "tablet": 15000,
    # tv
    "oled tv": 80000, "qled tv": 60000, "smart tv": 25000, "tv": 20000,
    # cameras
    "dslr": 35000, "mirrorless": 50000, "camera": 15000, "webcam": 3000,
    # wearables
    "apple watch": 35000, "samsung watch": 20000,
    "smartwatch": 5000, "fitness band": 2000,
    # accessories
    "power bank": 1500, "charger": 800, "cable": 300,
    "keyboard": 1500, "mouse": 800, "monitor": 12000,
    "router": 2000, "speaker": 2500, "soundbar": 8000,
    # generic
    "laptop": 40000, "phone": 15000, "mobile": 12000,
    "computer": 35000, "printer": 8000, "scanner": 5000,
}

FASHION_RULE_PRICES = {
    # premium materials
    "cashmere coat": 8000, "cashmere": 6000,
    "leather jacket": 5000, "leather": 4000,
    "silk dress": 4000, "silk": 3000,
    "velvet": 2500, "wool coat": 4000, "wool": 2000,
    "linen": 1500, "satin": 2000, "chiffon": 1800,
    # product types
    "coat": 3000, "jacket": 2500, "blazer": 2500,
    "dress": 1500, "gown": 3000,
    "jeans": 1200, "denim": 1200,
    "sweater": 1000, "hoodie": 900, "sweatshirt": 800,
    "shoes": 1500, "boots": 2000, "sneakers": 2000, "heels": 1800,
    "shirt": 700, "top": 600, "blouse": 700,
    "pants": 800, "trousers": 900, "skirt": 700,
    "shorts": 500, "t-shirt": 400, "tshirt": 400,
    "hat": 400, "cap": 350, "scarf": 500,
    "saree": 2000, "kurta": 800, "lehenga": 5000,
    "suit": 4000, "formal": 2000,
    # generic
    "cloth": 600, "clothes": 600, "clothing": 600,
    "wear": 600, "outfit": 800, "apparel": 700,
}

def rule_based_electronics_price(text: str) -> float:
    """Return a rule-based price estimate from product name/description."""
    t = text.lower()
    # Try longest match first (more specific = more accurate)
    for keyword in sorted(ELECTRONICS_RULE_PRICES, key=len, reverse=True):
        if keyword in t:
            return float(ELECTRONICS_RULE_PRICES[keyword])
    return 5000.0  # generic electronics fallback

def rule_based_fashion_price(text: str) -> float:
    """Return a rule-based price estimate from product name/description."""
    t = text.lower()
    for keyword in sorted(FASHION_RULE_PRICES, key=len, reverse=True):
        if keyword in t:
            return float(FASHION_RULE_PRICES[keyword])
    return 700.0  # generic clothing fallback

# ─────────────────────────────────────────────
# Electronics feature helpers
# ─────────────────────────────────────────────
def extract_category_elec(name):
    n = name.lower()
    if any(k in n for k in ["iphone","galaxy","smartphone","mobile","phone","narzo","nord","iqoo","redmi","poco","vivo","oppo","realme","motorola","nokia"]): return "smartphone"
    if any(k in n for k in ["laptop","macbook","notebook","chromebook"]): return "laptop"
    if any(k in n for k in ["tablet","ipad","tab "]): return "tablet"
    if any(k in n for k in ["earbuds","earphones","headphone","neckband","tws","earpods","buds","airpods"]): return "audio"
    if any(k in n for k in ["tv ","television","smart tv","oled","qled"]): return "tv"
    if any(k in n for k in ["camera","dslr","mirrorless","webcam"]): return "camera"
    if any(k in n for k in ["watch","smartwatch","band ","fitness"]): return "wearable"
    if any(k in n for k in ["charger","adapter","cable","power bank","powerbank"]): return "accessory"
    if any(k in n for k in ["speaker","soundbar","subwoofer"]): return "speaker"
    if any(k in n for k in ["printer","scanner","monitor","display","keyboard","mouse","router"]): return "computer_peripheral"
    return "other"

def extract_brand_elec(name):
    n = name.lower()
    for b in ["apple","samsung","oneplus","realme","redmi","xiaomi","oppo","vivo",
              "iqoo","poco","motorola","nokia","sony","lg","dell","hp","lenovo",
              "asus","acer","msi","boat","jbl","bose","sennheiser","canon","nikon",
              "logitech","tp-link","tapo","fujifilm"]:
        if b in n: return b
    return "other"

def extract_storage(name):
    m = re.search(r'(\d+)\s*(?:gb|tb)\s*(?:storage|rom|ssd|hdd)?', name.lower())
    if m:
        v = int(m.group(1))
        if "tb" in name.lower()[m.start():m.end()]: v *= 1024
        return min(v, 2048)
    return 0

def extract_ram(name):
    m = re.search(r'(\d+)\s*gb\s*(?:ram|lpddr)', name.lower())
    return min(int(m.group(1)), 64) if m else 0

def build_electronics_features(name: str, rating: float, review_count: int, bundle: dict) -> np.ndarray:
    tfidf = bundle["tfidf"]
    structured_cols = bundle["structured_cols"]
    tfidf_vec = tfidf.transform([name]).toarray()
    cat   = extract_category_elec(name)
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
        if col.startswith("category_"): row[col] = int(col == f"category_{cat}")
        elif col.startswith("brand_"):   row[col] = int(col == f"brand_{brand}")
    struct_vec = np.array([row.get(c, 0) for c in structured_cols]).reshape(1, -1)
    return np.concatenate([tfidf_vec, struct_vec], axis=1)

# ─────────────────────────────────────────────
# Fashion feature helpers
# ─────────────────────────────────────────────
MATERIALS = ["cotton","silk","linen","velvet","polyester","wool",
             "denim","leather","nylon","rayon","chiffon","satin","fleece","cashmere"]
COLORS    = ["red","blue","green","black","white","pink","grey","gray",
             "yellow","orange","purple","brown","beige","navy","maroon","teal","gold","silver"]

def extract_material_fashion(text):
    t = text.lower()
    for m in MATERIALS:
        if m in t: return m
    return "other"

def extract_color_fashion(text):
    t = text.lower()
    for c in COLORS:
        if c in t: return c
    return "other"

def normalize_product_fashion(product):
    cats = ["T-Shirt","Shirt","Pants","Shoes","Dress","Outwear","Longsleeve",
            "Shorts","Hat","Skirt","Jacket","Sweater","Jeans","Top","Coat","Hoodie",
            "Blazer","Saree","Kurta","Lehenga","Suit"]
    for cat in cats:
        if cat.lower() in str(product).lower(): return cat
    return "Other"

def build_fashion_features(product: str, description: str, bundle: dict) -> np.ndarray:
    tfidf            = bundle["tfidf"]
    structured_cols  = bundle["structured_cols"]
    le_material      = bundle["le_material"]
    le_color         = bundle["le_color"]
    le_product       = bundle["le_product"]
    MM               = bundle["MATERIAL_MULTIPLIER"]
    PB               = bundle["PRODUCT_BASE_PRICE"]
    CP               = bundle["COLOR_PREMIUM"]

    # Use combined text for TF-IDF
    combined_text = f"{product} {description}".strip()
    tfidf_vec = tfidf.transform([combined_text]).toarray()

    material     = extract_material_fashion(combined_text)
    color        = extract_color_fashion(combined_text)
    product_norm = normalize_product_fashion(product)
    prem         = int(any(k in combined_text.lower() for k in
                          ["premium","luxury","designer","exclusive","cashmere","silk","velvet","leather"]))

    mat_enc  = int(le_material.transform([material])[0])   if material      in le_material.classes_ else 0
    col_enc  = int(le_color.transform([color])[0])         if color         in le_color.classes_    else 0
    prod_enc = int(le_product.transform([product_norm])[0]) if product_norm in le_product.classes_  else 0

    mat_mul   = MM.get(material, 1.0)
    prod_base = float(PB.get(product_norm, 700))
    col_mul   = CP.get(color, 1.0)
    exp_price = prod_base * mat_mul * col_mul

    struct_vec = np.array([[mat_enc, col_enc, prod_enc, mat_mul, prod_base, col_mul, exp_price, prem]])
    return np.concatenate([tfidf_vec, struct_vec], axis=1)

# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "EcoCycleHUB Price Predictor API is running",
        "electronics_model": "loaded" if electronics_bundle else "not loaded",
        "fashion_model":     "loaded" if fashion_bundle     else "not loaded",
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict-price")
async def predict_price(
    name:         str   = Form(...),
    description:  str   = Form(""),
    category:     str   = Form(...),
    subCategory:  str   = Form(""),
    condition:    str   = Form("Good"),
    rating:       float = Form(4.0),
    review_count: int   = Form(100),
    image: UploadFile   = None,
):
    # ── Combine all text signals ─────────────────
    full_text = " ".join(filter(None, [name, subCategory, description])).strip()
    is_electronics = category.strip().lower() == "electronics"

    # ── Electronics ──────────────────────────────
    if is_electronics:
        # 1. Try ML model
        ml_price = None
        if electronics_bundle:
            try:
                features  = build_electronics_features(full_text, rating, review_count, electronics_bundle)
                ml_price  = float(electronics_bundle["model"].predict(features)[0])
            except Exception as e:
                print(f"Electronics ML error: {e}")

        # 2. Rule-based price from full text
        rule_price = rule_based_electronics_price(full_text)

        # 3. Blend: if ML gave a reasonable result (> floor), trust it;
        #    otherwise use rule-based
        ELEC_FLOOR = 500.0
        if ml_price and ml_price > ELEC_FLOOR:
            raw_price = ml_price
        else:
            raw_price = rule_price

        raw_price = max(ELEC_FLOOR, raw_price)

    # ── Fashion ──────────────────────────────────
    else:
        product = subCategory if subCategory else name
        desc    = description if description else full_text

        # 1. Try ML model
        ml_price = None
        if fashion_bundle:
            try:
                features = build_fashion_features(product, desc, fashion_bundle)
                ml_price = float(np.expm1(fashion_bundle["model"].predict(features)[0]))
            except Exception as e:
                print(f"Fashion ML error: {e}")

        # 2. Rule-based price from full text
        rule_price = rule_based_fashion_price(full_text)

        # 3. Blend: if ML gave a reasonable result (> floor), trust it;
        #    otherwise use rule-based
        FASH_FLOOR = 200.0
        if ml_price and ml_price > FASH_FLOOR:
            raw_price = ml_price
        else:
            raw_price = rule_price

        raw_price = max(FASH_FLOOR, raw_price)

    # ── Apply condition multiplier ───────────────
    multiplier  = CONDITION_MULTIPLIERS.get(condition, 0.65)
    final_price = raw_price * multiplier

    # ── Clamp to realistic bounds ────────────────
    if is_electronics:
        final_price = max(300.0, min(150000.0, final_price))
    else:
        final_price = max(100.0, min(15000.0, final_price))

    # Cleanup temp image
    if image:
        temp_path = f"temp_{image.filename}"
        if os.path.exists(temp_path):
            os.remove(temp_path)

    print(f"[predict] text='{full_text[:60]}' cat={'E' if is_electronics else 'F'} "
          f"ml={ml_price:.0f if ml_price else 'N/A'} rule={rule_price:.0f} "
          f"final=₹{final_price:.0f}")

    return {
        "predictedPrice":     round(final_price, 2),
        "domain":             "Electronics" if is_electronics else "Fashion",
        "condition":          condition,
        "conditionMultiplier": multiplier,
        "basePrice":          round(raw_price, 2),
    }
