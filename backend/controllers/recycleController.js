import RecycleSubmission from "../models/RecycleSubmission.js";
import { addPoints } from "./rewardController.js";
import mongoose from "mongoose";
import axios from 'axios';
import FormData from 'form-data';
import Center from "../models/centerModel.js";

// Helper: strict 24-char hex check
const isObjectId = (val) => typeof val === 'string' && /^[a-f\d]{24}$/i.test(val);

// ── Rule-based price fallback (used when ML API is unavailable) ──────────────
const ELECTRONICS_PRICES = {
  "iphone": 45000, "macbook pro": 110000, "macbook air": 75000, "macbook": 85000,
  "ipad pro": 75000, "ipad air": 50000, "ipad": 35000,
  "samsung galaxy s": 55000, "samsung galaxy a": 18000, "samsung": 15000,
  "oneplus": 22000, "redmi note": 14000, "redmi": 10000,
  "realme": 12000, "poco": 13000, "iqoo": 16000,
  "vivo": 13000, "oppo": 12000, "motorola": 11000, "nokia": 8000,
  "dell xps": 75000, "dell": 42000, "hp spectre": 70000, "hp": 38000,
  "lenovo thinkpad": 55000, "lenovo": 38000,
  "asus rog": 75000, "asus": 42000, "acer": 32000,
  "airpods pro": 18000, "airpods": 12000,
  "sony wh": 16000, "bose": 20000, "jbl": 2500,
  "boat": 1200, "earbuds": 1500, "earphone": 800, "headphone": 2000, "neckband": 900,
  "smart tv": 22000, "oled tv": 75000, "tv": 18000,
  "dslr": 32000, "mirrorless": 45000, "camera": 12000, "webcam": 2500,
  "apple watch": 32000, "smartwatch": 4500, "fitness band": 1800,
  "power bank": 1200, "charger": 700, "speaker": 2000, "soundbar": 7000,
  "monitor": 10000, "keyboard": 1200, "mouse": 700, "router": 1800,
  "laptop": 38000, "phone": 12000, "mobile": 10000, "tablet": 14000,
  "computer": 32000, "printer": 7000,
};

const FASHION_PRICES = {
  "cashmere coat": 7500, "cashmere": 5500,
  "leather jacket": 4500, "leather": 3500,
  "silk dress": 3800, "silk": 2800,
  "velvet": 2200, "wool coat": 3500, "wool": 1800,
  "linen": 1400, "satin": 1800, "chiffon": 1600,
  "coat": 2800, "jacket": 2200, "blazer": 2200,
  "dress": 1400, "gown": 2800,
  "jeans": 1100, "denim": 1100,
  "sweater": 900, "hoodie": 800, "sweatshirt": 750,
  "shoes": 1400, "boots": 1800, "sneakers": 1800, "heels": 1600,
  "shirt": 650, "top": 550, "blouse": 650,
  "pants": 750, "trousers": 850, "skirt": 650,
  "shorts": 450, "t-shirt": 380, "tshirt": 380,
  "hat": 350, "cap": 300, "scarf": 450,
  "saree": 1800, "kurta": 750, "lehenga": 4500,
  "suit": 3500, "formal": 1800,
};

const CONDITION_MULTIPLIERS = {
  "New": 1.0, "Like New": 0.90, "Excellent": 0.80,
  "Good": 0.65, "Fair": 0.45, "Poor": 0.30,
};

function getRuleBasedPrice(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();

  // Try electronics first (longer match = more specific)
  for (const key of Object.keys(ELECTRONICS_PRICES).sort((a, b) => b.length - a.length)) {
    if (text.includes(key)) return ELECTRONICS_PRICES[key];
  }
  // Try fashion
  for (const key of Object.keys(FASHION_PRICES).sort((a, b) => b.length - a.length)) {
    if (text.includes(key)) return FASHION_PRICES[key];
  }
  return 500; // generic fallback
}

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
      const mlApiUrl = process.env.ML_API_URL;

      // Skip ML call if no URL is configured
      if (!mlApiUrl) {
        console.log("ML_API_URL not set — using rule-based fallback price");
        const basePrice = getRuleBasedPrice(productName, productDescription || description);
        const mul = CONDITION_MULTIPLIERS[condition] ?? 0.65;
        predictedPrice = Math.round(basePrice * mul);
      } else {
        // Auto-detect category from product name
        const nameLower = (productName || '').toLowerCase();
        const isElectronics = /phone|laptop|tablet|earphone|earbuds|headphone|camera|tv|watch|charger|speaker|computer|monitor|printer|router|keyboard|mouse|iphone|samsung|dell|hp|lenovo|asus|oneplus|redmi|realme/.test(nameLower);
        const category = isElectronics ? 'Electronics' : 'Fashion';

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription || description || productName);
        formData.append('category', category);
        formData.append('subCategory', '');
        formData.append('condition', condition || 'Good');
        formData.append('rating', '4.0');
        formData.append('review_count', '100');

        const mlRes = await axios.post(mlApiUrl, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 8000
        });

        if (mlRes.data && mlRes.data.predictedPrice) {
          predictedPrice = Number(mlRes.data.predictedPrice);
        }
      }
    } catch (error) {
      console.error("ML Prediction failed:", error.message, "— using rule-based fallback");
      const basePrice = getRuleBasedPrice(productName, productDescription || description);
      const mul = CONDITION_MULTIPLIERS[condition] ?? 0.65;
      predictedPrice = Math.round(basePrice * mul);
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