# Adding Electronics & Predicting Price with Your Images

The ML model now supports **Electronics** as well as Fashion. You can add your own electronics images and train the model to predict prices. Here’s what to do.

---

## 1. Where to put your images

- Put all product images inside the **`ml_model/images/`** folder (create it if it doesn’t exist).
- You can use subfolders if you like, e.g. `ml_model/images/phones/`, `ml_model/images/laptops/`, but in the CSV you must use paths relative to `ml_model/`, e.g. `images/phones/img1.jpg`.

**Examples:**
- `ml_model/images/phone1.jpg`
- `ml_model/images/electronics/laptop1.jpg` → in CSV use `images/electronics/laptop1.jpg`

---

## 2. Create a CSV for electronics (and/or use existing fashion CSV)

The model expects a CSV with at least these columns:

| Column        | Description |
|---------------|-------------|
| `image_path`  | Path to image relative to `ml_model/`, e.g. `images/phone1.jpg` |
| `Product`     | Type: **Phone**, **Laptop**, **Tablet**, **Headphones**, **Camera**, **TV**, **Accessories**, **Monitor**, **Speaker** |
| `price`       | Price in rupees (number, e.g. `25000` or `₹25,000` – both are cleaned automatically) |
| `description` | Short text description of the product |

**Example `electronics_images.csv` (save this in the `ml_model` folder):**

```csv
image_path,Product,price,description
images/phone1.jpg,Phone,25000,Samsung Galaxy smartphone 128GB
images/phone2.jpg,Phone,18000,Redmi Note good condition
images/laptop1.jpg,Laptop,45000,Dell Inspiron 15
images/headphones1.jpg,Headphones,3500,Wireless Bluetooth headphones
images/tablet1.jpg,Tablet,22000,iPad style tablet 64GB
```

- Use **Product** values exactly as in the table (Phone, Laptop, etc.) so the model can map them to subcategories and price ranges.
- You can add more rows; more (good-quality) images and correct prices will improve predictions.

---

## 3. (Optional) Combine with existing fashion data

- **Fashion data:** Keep using `cleaned_images.csv` in `ml_model/` as before.
- **Electronics data:** Add `electronics_images.csv` in the same `ml_model/` folder with the format above.
- When you run training, the script will **merge** both CSVs and train one model that handles both Fashion and Electronics.

---

## 4. Train the model

In a terminal, from the **`ml_model`** folder:

```bash
cd ml_model
venv\Scripts\Activate
python train_improved.py
```

- This loads `cleaned_images.csv` and, if present, `electronics_images.csv`, merges them, and trains the multimodal price model.
- After training, the saved model is used by the API for both fashion and electronics.

---

## 5. Using the app with your images

- **Admin Add Product:** Choose category **Electronics**, then pick a subcategory (e.g. Phones, Laptops, Tablets, Accessories, Audio, Display, Other).
- Upload **one or more images** of the product, enter name and description, then click **Predict Price**.
- The predicted price will be in the **Electronics range** (₹100 – ₹1,00,000). Fashion stays in the existing range (e.g. ₹50 – ₹1,500).

---

## Quick checklist

1. Put images in `ml_model/images/` (paths as in CSV).
2. Create `electronics_images.csv` in `ml_model/` with columns: `image_path`, `Product`, `price`, `description`.
3. Use Product values: Phone, Laptop, Tablet, Headphones, Camera, TV, Accessories, Monitor, Speaker.
4. Run `python train_improved.py` from `ml_model` (with venv activated).
5. In the app, select **Electronics** and the right subcategory, upload an image, and use **Predict Price**.

If you share your CSV (and optionally image paths), we can double-check the format or adjust the Product/subcategory list.
