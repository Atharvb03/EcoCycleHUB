// backend/controllers/productController.js
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

// Base URL for ML price prediction service
const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8000/predict-price";
const PRODUCT_PRICE_RULES = {
    electronics: {
        "macbook pro": 120000, "macbook air": 80000, "macbook": 85000,
        "iphone": 55000, "ipad pro": 80000, "ipad air": 55000, "ipad": 40000,
        "samsung galaxy s": 60000, "samsung galaxy a": 20000, "samsung": 15000,
        "oneplus": 25000, "pixel": 45000, "redmi note": 15000, "redmi": 12000,
        "realme": 13000, "poco": 14000, "iqoo": 18000, "vivo": 15000,
        "oppo": 14000, "motorola": 12000, "nokia": 10000,
        "dell xps": 80000, "dell": 45000, "hp spectre": 75000, "hp": 40000,
        "lenovo thinkpad": 60000, "lenovo": 40000, "asus rog": 80000,
        "asus": 45000, "acer": 35000, "airpods pro": 20000, "airpods": 14000,
        "sony wh": 18000, "bose": 22000, "boat": 1500, "jbl": 3000,
        "earbuds": 1500, "earphone": 800, "headphone": 2000, "neckband": 1000,
        "smart tv": 25000, "oled tv": 80000, "qled tv": 60000, "tv": 20000,
        "dslr": 35000, "mirrorless": 50000, "camera": 15000, "webcam": 3000,
        "apple watch": 35000, "smartwatch": 5000, "fitness band": 2000,
        "power bank": 1500, "charger": 800, "speaker": 2500, "soundbar": 8000,
        "monitor": 12000, "keyboard": 1500, "mouse": 800, "router": 2000,
        "laptop": 40000, "phone": 15000, "mobile": 12000, "tablet": 15000,
        "computer": 35000, "printer": 8000
    },
    fashion: {
        "cashmere coat": 8000, "cashmere": 6000, "leather jacket": 5000,
        "leather": 4000, "silk dress": 4000, "silk": 3000, "velvet": 2500,
        "wool coat": 4000, "wool": 2000, "linen": 1500, "satin": 2000,
        "chiffon": 1800, "coat": 3000, "jacket": 2500, "blazer": 2500,
        "dress": 1500, "gown": 3000, "jeans": 1200, "denim": 1200,
        "sweater": 1000, "hoodie": 900, "sweatshirt": 800, "shoes": 1500,
        "boots": 2000, "sneakers": 2000, "heels": 1800, "shirt": 700,
        "top": 600, "blouse": 700, "pants": 800, "trousers": 900,
        "skirt": 700, "shorts": 500, "t-shirt": 400, "tshirt": 400,
        "hat": 400, "cap": 350, "scarf": 500, "saree": 2000,
        "kurta": 800, "lehenga": 5000, "suit": 4000, "formal": 2000
    }
};

const CONDITION_MULTIPLIERS = {
    "New": 1,
    "Like New": 0.9,
    "Excellent": 0.8,
    "Good": 0.65,
    "Fair": 0.45,
    "Poor": 0.3
};

const getFallbackPredictedPrice = ({ name = "", description = "", category = "", subCategory = "", condition = "Good" }) => {
    const isElectronics = category.toLowerCase() === "electronics";
    const rules = isElectronics ? PRODUCT_PRICE_RULES.electronics : PRODUCT_PRICE_RULES.fashion;
    const text = `${name} ${subCategory} ${description}`.toLowerCase();
    const match = Object.keys(rules).sort((a, b) => b.length - a.length).find(key => text.includes(key));
    const basePrice = match ? rules[match] : (isElectronics ? 5000 : 700);
    const multiplier = CONDITION_MULTIPLIERS[condition] ?? 0.65;
    const price = Math.round(basePrice * multiplier);
    return isElectronics ? Math.max(100, Math.min(100000, price)) : Math.max(50, Math.min(1500, price));
};

// ===================== ADD PRODUCT =====================
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const images = [];
        ['image1', 'image2', 'image3', 'image4'].forEach(key => {
            if (req.files?.[key]) images.push(req.files[key][0]);
        });

        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" || bestseller === true,
            sizes: JSON.parse(sizes || "[]"),
            image: imagesUrl,
            date: Date.now(),
            sellerId: req.sellerId || null   // set if request came from a seller
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ===================== LIST PRODUCTS =====================
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});

        // Collect unique sellerIds and cast to ObjectId for proper matching
        const rawIds = [...new Set(products.map(p => p.sellerId).filter(Boolean))];
        console.log('[listProducts] rawSellerIds:', rawIds);

        const objectIds = rawIds
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

        console.log('[listProducts] valid objectIds:', objectIds.length);

        const sellers = objectIds.length
            ? await userModel.find({ _id: { $in: objectIds } }).select('name mobile')
            : [];

        console.log('[listProducts] sellers found:', sellers.map(s => ({ id: s._id, name: s.name, mobile: s.mobile })));

        const sellerMap = {};
        sellers.forEach(s => { sellerMap[s._id.toString()] = { name: s.name, mobile: s.mobile }; });

        const enriched = products.map(p => {
            const obj = p.toObject();
            const info = p.sellerId ? sellerMap[p.sellerId.toString()] : null;
            if (info) { obj.sellerName = info.name; obj.sellerMobile = info.mobile; }
            return obj;
        });

        res.json({ success: true, products: enriched });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ===================== LIST SELLER'S OWN PRODUCTS =====================
const listSellerProducts = async (req, res) => {
    try {
        const products = await productModel.find({ sellerId: req.sellerId });
        const seller = await userModel.findById(req.sellerId).select('name mobile');
        const enriched = products.map(p => {
            const obj = p.toObject();
            if (seller) { obj.sellerName = seller.name; obj.sellerMobile = seller.mobile; }
            return obj;
        });
        res.json({ success: true, products: enriched });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ===================== REMOVE PRODUCT =====================
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ===================== REMOVE SELLER'S OWN PRODUCT =====================
const removeSellerProduct = async (req, res) => {
    try {
        const product = await productModel.findOne({ _id: req.body.id, sellerId: req.sellerId });
        if (!product) return res.json({ success: false, message: "Product not found or not yours" });
        await product.deleteOne();
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ===================== SINGLE PRODUCT =====================
const singleProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.productId);
        res.json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ===================== PREDICT PRICE =====================
const predictPrice = async (req, res) => {
    const imageFile = req.files?.image1 ? req.files.image1[0] : null;

    try {
        const { name, description, category, subCategory, condition = "Good" } = req.body;

        if (!name || !description || !category || !subCategory) {
            return res.json({ success: false, message: "Please provide all product details" });
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("subCategory", subCategory);
        formData.append("condition", condition);

        if (imageFile) {
            formData.append("image", fs.createReadStream(imageFile.path));
        }

        let predictedPriceInr;

        try {
            const response = await axios.post(ML_API_URL, formData, {
                headers: formData.getHeaders(),
                timeout: 8000
            });
            predictedPriceInr = Number(response.data.predictedPrice) || 0;
        } catch (mlError) {
            console.error("ML price prediction unavailable, using fallback:", mlError.message);
            predictedPriceInr = getFallbackPredictedPrice({ name, description, category, subCategory, condition });
        }

        if (category === "Electronics") {
            predictedPriceInr = Math.max(100, Math.min(100000, predictedPriceInr));
        } else {
            predictedPriceInr = Math.max(50, Math.min(1500, predictedPriceInr));
        }

        return res.json({ success: true, predictedPrice: predictedPriceInr });
    } catch (error) {
        console.error("Error while predicting price:", error.message);
        return res.status(500).json({
            success: false,
            message: `Failed to predict price: ${error.message}`
        });
    } finally {
        if (imageFile?.path) {
            fs.promises.unlink(imageFile.path).catch(() => {});
        }
    }
};



export { listProducts, addProduct, removeProduct, singleProduct, predictPrice, listSellerProducts, removeSellerProduct };
