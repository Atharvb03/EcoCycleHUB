import express from "express";
import multer from "multer";
import { listProducts, addProduct, removeProduct, singleProduct, predictPrice, listSellerProducts, removeSellerProduct } from "../controllers/productController.js";
import sellerAuth from "../middleware/sellerAuth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public routes
router.get("/list", listProducts);
router.post("/single", singleProduct);

// Admin routes
router.post("/add", upload.fields([{ name: "image1" }, { name: "image2" }, { name: "image3" }, { name: "image4" }]), addProduct);
router.post("/remove", removeProduct);
router.post("/predict-price", upload.fields([{ name: "image1" }]), predictPrice);

// Seller-scoped routes
router.get("/seller/list", sellerAuth, listSellerProducts);
router.post("/seller/remove", sellerAuth, removeSellerProduct);
router.post("/seller/add", sellerAuth, upload.fields([{ name: "image1" }, { name: "image2" }, { name: "image3" }, { name: "image4" }]), addProduct);

export default router;
