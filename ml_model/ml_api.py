from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ml_model import MultiModalPricePredictor
import os

app = FastAPI(title="MultiModal Price Predictor API")

# Load model once at startup
predictor = MultiModalPricePredictor()
predictor.load_model("multimodal_price_predictor.pkl")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Root route to check server status
@app.get("/")
def root():
    return {"message": "ML Price Predictor API is running"}

# Prediction endpoint
@app.post("/predict-price")
async def predict_price(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subCategory: str = Form(...),
    gender: str = Form("Unisex"),
    color: str = Form("Black"),
    season: str = Form("All Season"),
    condition: str = Form("Good"),  # New parameter
    image: UploadFile = None
):
    # Handle uploaded image
    image_path = "sample_image.jpg"  # fallback
    if image:
        image_path = f"temp_{image.filename}"
        with open(image_path, "wb") as f:
            f.write(await image.read())

    # Debug logging
    print(f"Received prediction request: Category='{category}', SubCategory='{subCategory}'")
    print(f"Description: {description[:50]}...")

    # Determine product domain for price clamping (Electronics vs Fashion)
    # Make check case-insensitive and robust
    is_electronics_category = category.strip().title() == "Electronics"
    product_domain = "Electronics" if is_electronics_category else "Fashion"
    print(f"Determined Domain: {product_domain}")
    # For API: category is main category (Men/Women/Kids/Electronics), subCategory is e.g. Phones, Laptops or Topwear
    additional_features = {
        "gender": gender,
        "sub_category": subCategory,
        "color": color,
        "season": season,
        "condition": condition,
        "product_domain": product_domain
    }
    # Pass subCategory as product_type when Electronics (Phones, Laptops, etc.), else category
    product_type = subCategory if product_domain == "Electronics" else category

    # Predict price
    price = predictor.predict_price(image_path, product_type, description, additional_features)

    # Clamp by domain (model also clamps; this is a safeguard)
    price = float(price)
    if product_domain == "Electronics":
        price = max(100, min(100000, price))
    else:
        price = max(50, min(1500, price))

    # ✅ Ensure exactly 2 decimal places (float with rounding)
    clean_price = round(price, 2)

    # ✅ Optional: If your frontend prefers string (for formatting), use:
    # clean_price = f"{float(price):.2f}"

    # Cleanup temp image
    if image and os.path.exists(image_path):
        os.remove(image_path)

    # ✅ Return clean, formatted JSON
    return {"predictedPrice": clean_price}
