import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import sellerAuth from "../middleware/sellerAuth.js";
import {
  getAllUsersWithPoints,
  getAllRecycleSubmissions,
  getUserRecycleSubmissions,
  getPendingSellers,
  reviewSeller,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", sellerAuth, getAllUsersWithPoints);
router.get("/recycles", sellerAuth, getAllRecycleSubmissions);
router.get("/recycles/user/:userId", sellerAuth, getUserRecycleSubmissions);

// Admin-only: seller KYC review (uses original adminAuth)
router.get("/pending-sellers", adminAuth, getPendingSellers);
router.post("/review-seller", adminAuth, reviewSeller);

export default router;
