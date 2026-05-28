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
    try {
        const { name, description, category, subCategory } = req.body;
        const imageFile = req.files?.image1 ? req.files.image1[0] : null;

        if (!name || !description || !category || !subCategory) {
            return res.json({ success: false, message: "Please provide all product details" });
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("subCategory", subCategory);

        if (imageFile) {
            formData.append("image", fs.createReadStream(imageFile.path));
        }

        const response = await axios.post(ML_API_URL, formData, {
            headers: formData.getHeaders()
        });

        // ML returns price in INR (based on training data)
        let predictedPriceInr = Number(response.data.predictedPrice) || 0;

        // Clamp by category: Electronics 100–100000, Fashion 50–1500
        if (category === "Electronics") {
            predictedPriceInr = Math.max(100, Math.min(100000, predictedPriceInr));
        } else {
            predictedPriceInr = Math.max(50, Math.min(1500, predictedPriceInr));
        }

        // Return cleaned price
        return res.json({ success: true, predictedPrice: predictedPriceInr });
    } catch (error) {
        console.error("Error while calling ML API:", error.message);
        if (error.response) {
            console.error("ML API Response:", error.response.data);
            console.error("ML API Status:", error.response.status);
        }

        if (error.code === "ECONNREFUSED") {
            return res.status(503).json({
                success: false,
                message: "Price prediction service is unavailable. Please make sure the ML server is running."
            });
        }

        return res.status(500).json({
            success: false,
            message: `Failed to predict price: ${error.message}`
        });
    }
};



export { listProducts, addProduct, removeProduct, singleProduct, predictPrice, listSellerProducts, removeSellerProduct };
