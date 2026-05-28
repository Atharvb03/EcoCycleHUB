import express from "express";
import { getMyRewards, getLeaderboard, getUserRecycleHistory } from "../controllers/rewardController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyRewards);
router.get("/leaderboard", authMiddleware, getLeaderboard);
router.get("/history/:userId", authMiddleware, getUserRecycleHistory);

export default router;
