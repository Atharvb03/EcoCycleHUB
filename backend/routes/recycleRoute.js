import express from "express";
import authUser from "../middleware/auth.js";
import { createRecycle, myRecycles } from "../controllers/recycleController.js";

const router = express.Router();

router.post("/", authUser, createRecycle);      // POST /api/recycle
router.get("/mine", authUser, myRecycles);      // GET  /api/recycle/mine

export default router;