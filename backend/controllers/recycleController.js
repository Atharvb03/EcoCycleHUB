import RecycleSubmission from "../models/RecycleSubmission.js";
import { addPoints } from "./rewardController.js";
import mongoose from "mongoose";
import axios from 'axios';
import FormData from 'form-data';
import Center from "../models/centerModel.js";

// Helper: strict 24-char hex check — mongoose.Types.ObjectId.isValid() returns true for numbers too
const isObjectId = (val) => typeof val === 'string' && /^[a-f\d]{24}$/i.test(val);

export const createRecycle = async (req, res) => {
  try {
    const userId = req.userId;
    const { centerId, centerName, productName, productDescription, actionType, description, condition } = req.body;

    console.log('Recycle submission request:', { userId, centerId, centerName, productName, actionType });

    if (!userId) return res.status(401).json({ success: false, message: "Not authorized" });
    if (!centerId && !centerName) return res.status(400).json({ success: false, message: "Center is required" });
    if (!productName) return res.status(400).json({ success: false, message: "Product name is required" });
    if (!actionType || !['recycle', 'repair'].includes(actionType)) {
      return res.status(400).json({ success: false, message: "Action type must be 'recycle' or 'repair'" });
    }

    // Determine if centerId is a valid ObjectId (DB center) or a manual/fallback center
    const isValidObjectId = centerId && mongoose.Types.ObjectId.isValid(centerId);

    // Call ML API for price prediction
    let predictedPrice = 0;
    try {
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('description', productDescription || description || productName);
      formData.append('category', 'Recycle'); // Default
      formData.append('subCategory', 'Mixed'); // Default
      formData.append('condition', condition || 'Good');

      // Timeout of 5 seconds to not block
      const mlRes = await axios.post('http://127.0.0.1:8000/predict-price', formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 5000
      });

      if (mlRes.data && mlRes.data.predictedPrice) {
        predictedPrice = Number(mlRes.data.predictedPrice);
      }
    } catch (error) {
      console.error("ML Prediction failed:", error.message);
      // Continue without price, default to 0
    }

    const docData = {
      userId,
      centerName: centerName || (isValidObjectId ? '' : `Center #${centerId}`),
      productName,
      productDescription,
      actionType,
      description,
      condition: condition || 'Good',
      predictedPrice
    };
    // Only set centerId when it's a real ObjectId — never pass numeric/invalid values
    if (isValidObjectId) docData.centerId = centerId;

    const rec = await RecycleSubmission.create(docData);

    // +20 points for both recycle and repair
    await addPoints(userId, 20, "recycle");

    const actionText = actionType === 'recycle' ? 'Recycling' : 'Repair';
    return res.json({
      success: true,
      message: `${actionText} submission recorded! You earned 20 points.`,
      recycle: rec,
      pointsEarned: 20
    });
  } catch (err) {
    console.error('Error in createRecycle:', err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

export const myRecycles = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Not authorized" });

    const submissions = await RecycleSubmission.find({ userId }).sort({ createdAt: -1 });

    const populated = await Promise.all(submissions.map(async (sub) => {
      const obj = sub.toObject();
      const rawId = obj.centerId;
      if (isObjectId(String(rawId))) {
        const center = await Center.findById(rawId).select("name address phone type");
        obj.centerId = center || null;
      } else {
        obj.centerId = null;
      }
      return obj;
    }));

    return res.json({ success: true, recycles: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};