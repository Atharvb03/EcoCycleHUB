import RecycleSubmission from "../models/RecycleSubmission.js";
import { addPoints } from "./rewardController.js";
import mongoose from "mongoose";
import axios from 'axios';
import FormData from 'form-data';
import Center from "../models/centerModel.js";

// ─────────────────────────────────────────────────────────────
// Rule-based price estimator (runs locally in the backend)
// Used as primary source when ML API is unavailable / deployed
// ─────────────────────────────────────────────────────────────

const ELECTRONICS_PRICES = {
  // Apple
  "iphone 15 pro max": 120000, "iphone 15 pro": 100000,
  "iphone 15":  75000, "iphone 14": 60000, "iphone 13": 50000,
  "iphone 12":  40000, "iphone 11": 30000,
  "macbook pro": 120000, "macbook air": 80000, "macbook": 80000,
  "ipad pro": 80000, "ipad air": 55000, "ipad mini": 40000, "ipad": 40000,
  "airpods pro": 20000, "airpods": 14000,
  "apple watch ultra": 80000, "apple watch": 35000,
  // Samsung
  "samsung galaxy s24 ultra": 100000, "samsung galaxy s24": 70000,
  "samsung galaxy s23": 55000, "samsung galaxy s22": 45000,
  "samsung galaxy a54": 28000, "samsung galaxy a34": 22000,
  "samsung galaxy m": 15000,
  "samsung tab s9": 60000, "samsung tab": 25000,
  // OnePlus / Xiaomi ecosystem
  "oneplus 12": 60000, "oneplus 11": 50000, "oneplus nord": 25000,
  "oneplus": 20000,
  "redmi note 13 pro": 25000, "redmi note 13": 18000,
  "redmi note 12": 16000, "redmi note": 15000, "redmi": 12000,
  "poco x6 pro": 22000, "poco x6": 18000, "poco": 14000,
  "realme gt": 30000, "realme narzo": 12000, "realme": 13000,
  "iqoo 12": 50000, "iqoo": 18000,
  "vivo x100": 60000, "vivo": 15000,
  "oppo find": 50000, "oppo reno": 25000, "oppo": 14000,
  "motorola edge": 25000, "motorola": 12000,
  "nokia": 10000,
  // Laptops
  "dell xps 15": 120000, "dell xps 13": 95000, "dell xps": 90000,
  "dell inspiron 15": 55000, "dell inspiron": 50000, "dell": 45000,
  "hp spectre": 90000, "hp envy": 70000, "hp pavilion": 45000, "hp": 40000,
  "lenovo thinkpad x1": 120000, "lenovo thinkpad": 65000,
  "lenovo ideapad gaming": 70000, "lenovo ideapad": 45000, "lenovo": 40000,
  "asus rog zephyrus": 130000, "asus rog": 90000,
  "asus zenbook": 80000, "asus vivobook": 50000, "asus": 50000,
  "acer predator": 80000, "acer aspire": 40000, "acer": 35000,
  // Audio
  "sony wh-1000xm5": 25000, "sony wh-1000xm4": 18000,
  "bose quietcomfort 45": 30000, "bose": 22000,
  "sennheiser momentum": 20000, "sennheiser": 10000,
  "jbl tune": 3000, "jbl": 4000,
  "boat rockerz": 2500, "boat airdopes": 2000, "boat": 1500,
  "earbuds": 1500, "earphone": 800, "headphone": 2000, "neckband": 1000,
  // TV
  "samsung qled 65": 120000, "samsung oled": 150000,
  "lg oled 65": 150000, "lg oled": 100000,
  "sony bravia 65": 100000, "sony bravia": 70000,
  "mi tv 4k": 35000, "mi tv": 25000,
  "smart tv 65": 60000, "smart tv 55": 40000,
  "smart tv 43": 28000, "smart tv 32": 18000,
  "tv 65": 50000, "tv 55": 35000, "tv 43": 22000, "tv 32": 15000,
  "tv": 20000,
  // Camera
  "canon eos r5": 300000, "canon eos r6": 200000,
  "sony a7 iv": 200000, "sony a6400": 80000,
  "nikon z6": 150000, "nikon d7500": 100000,
  "dslr": 50000, "mirrorless": 80000,
  "gopro hero 12": 35000, "gopro": 25000,
  "webcam": 3000, "camera": 15000,
  // Wearables
  "apple watch ultra": 80000, "apple watch series 9": 45000,
  "samsung galaxy watch 6": 30000, "samsung galaxy watch": 22000,
  "fitbit": 8000, "garmin": 20000,
  "smartwatch": 5000, "fitness band": 2000, "smart band": 1500,
  // Accessories
  "power bank 20000": 2000, "power bank 10000": 1200,
  "power bank": 1500,
  "charger": 800, "cable": 300, "adapter": 600,
  "keyboard mechanical": 5000, "keyboard": 1500,
  "gaming mouse": 3000, "mouse": 800,
  "monitor 27": 18000, "monitor 24": 12000, "monitor": 10000,
  "router wifi 6": 5000, "router": 2000,
  "soundbar": 8000, "speaker": 2500,
  "ssd 1tb": 8000, "ssd 512gb": 5000, "ssd": 4000,
  "hard disk 2tb": 5000, "hard disk": 3000,
  "pen drive": 500, "memory card": 400,
  // Generic fallbacks
  "laptop": 45000, "phone": 15000, "mobile": 12000,
  "computer": 35000, "printer": 8000, "scanner": 5000,
  "tablet": 20000, "electronics": 5000,
};

const FASHION_PRICES = {
  // Premium materials + product
  "cashmere coat": 9000, "cashmere sweater": 6000, "cashmere": 6000,
  "leather jacket": 5500, "leather bag": 4000, "leather shoes": 4500, "leather": 4000,
  "silk saree": 8000, "silk dress": 4500, "silk shirt": 3000, "silk": 3000,
  "velvet dress": 3500, "velvet blazer": 4000, "velvet": 2500,
  "wool coat": 4500, "wool sweater": 2500, "wool jacket": 3500, "wool": 2000,
  "linen suit": 4000, "linen shirt": 1500, "linen": 1500,
  // Ethnic wear
  "lehenga choli": 8000, "lehenga": 6000,
  "bridal saree": 15000, "designer saree": 8000, "silk saree": 5000, "saree": 2500,
  "sherwani": 8000, "kurta pajama": 1500, "kurta set": 2000, "kurta": 800,
  "salwar kameez": 1500, "anarkali": 2500,
  // Western wear
  "formal suit": 8000, "suit": 5000, "blazer": 3000,
  "trench coat": 4000, "overcoat": 3500, "coat": 3000,
  "denim jacket": 2000, "bomber jacket": 2500, "jacket": 2500,
  "party dress": 2500, "maxi dress": 2000, "mini dress": 1500, "dress": 1500,
  "gown": 4000,
  "jeans": 1200, "denim": 1200,
  "formal trousers": 1200, "trousers": 1000, "chinos": 1000, "pants": 800,
  "sweater": 1000, "sweatshirt": 900, "hoodie": 900,
  "formal shirt": 800, "shirt": 700, "top": 600, "blouse": 700,
  "shorts": 500, "skirt": 700,
  "t-shirt": 400, "tshirt": 400, "polo": 600,
  // Footwear
  "nike shoes": 5000, "adidas shoes": 4000, "puma shoes": 3000,
  "formal shoes": 3000, "sports shoes": 2500, "running shoes": 2500,
  "boots": 2500, "sneakers": 2500, "heels": 2000, "sandals": 800,
  "shoes": 1500, "footwear": 1200,
  // Accessories
  "handbag": 1500, "backpack": 1200, "bag": 1000,
  "belt": 500, "wallet": 600, "watch": 2000,
  "sunglasses": 800, "hat": 400, "cap": 350, "scarf": 500,
  // Generic
  "cloth": 600, "clothes": 600, "clothing": 600,
  "wear": 600, "outfit": 800, "apparel": 700,
  "garment": 600, "fashion": 700,
};

const CONDITION_MULTIPLIERS = {
  "New": 1.0, "Like New": 0.90, "Excellent": 0.80,
  "Good": 0.65, "Fair": 0.45, "Poor": 0.30,
};

function detectCategory(text) {
  const t = text.toLowerCase();
  const electronicsKeywords = /phone|mobile|laptop|tablet|iphone|samsung|dell|hp|lenovo|asus|oneplus|redmi|realme|poco|iqoo|vivo|oppo|motorola|nokia|earphone|earbuds|headphone|neckband|camera|dslr|tv|television|watch|smartwatch|charger|speaker|soundbar|computer|monitor|printer|scanner|router|keyboard|mouse|ssd|hard.?disk|pen.?drive|memory.?card|macbook|ipad|airpods|bluetooth/;
  return electronicsKeywords.test(t) ? 'Electronics' : 'Fashion';
}

function ruleBasedPrice(text, category) {
  const t = text.toLowerCase();
  const priceMap = category === 'Electronics' ? ELECTRONICS_PRICES : FASHION_PRICES;

  // longest match first (more specific = more accurate)
  const sortedKeys = Object.keys(priceMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (t.includes(key)) return priceMap[key];
  }

  return category === 'Electronics' ? 5000 : 700;
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
const isObjectId = (val) => typeof val === 'string' && /^[a-f\d]{24}$/i.test(val);

// ─────────────────────────────────────────────────────────────
// createRecycle
// ─────────────────────────────────────────────────────────────
export const createRecycle = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      centerId, centerName, productName,
      productDescription, actionType, description, condition
    } = req.body;

    console.log('Recycle submission:', { userId, productName, actionType, condition });

    if (!userId)      return res.status(401).json({ success: false, message: "Not authorized" });
    if (!centerId && !centerName) return res.status(400).json({ success: false, message: "Center is required" });
    if (!productName) return res.status(400).json({ success: false, message: "Product name is required" });
    if (!actionType || !['recycle', 'repair'].includes(actionType))
      return res.status(400).json({ success: false, message: "Action type must be 'recycle' or 'repair'" });

    const isValidObjectId = centerId && mongoose.Types.ObjectId.isValid(centerId);

    // ── Step 1: Rule-based price (always works, no network needed) ──
    const fullText   = [productName, productDescription, description].filter(Boolean).join(' ');
    const category   = detectCategory(fullText);
    const condKey    = condition || 'Good';
    const condMul    = CONDITION_MULTIPLIERS[condKey] ?? 0.65;
    const baseRule   = ruleBasedPrice(fullText, category);
    let predictedPrice = Math.round(baseRule * condMul);

    // ── Step 2: Try ML API — use its result if available & reasonable ──
    const mlApiUrl = process.env.ML_API_URL;
    if (mlApiUrl && !mlApiUrl.includes('127.0.0.1') && !mlApiUrl.includes('localhost')) {
      try {
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription || description || productName);
        formData.append('category', category);
        formData.append('subCategory', '');
        formData.append('condition', condKey);
        formData.append('rating', '4.0');
        formData.append('review_count', '100');

        const mlRes = await axios.post(mlApiUrl, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 6000,
        });

        const mlPrice = Number(mlRes.data?.predictedPrice);
        if (mlPrice && mlPrice > 100) {
          console.log(`ML price: ₹${mlPrice} (rule was ₹${predictedPrice})`);
          predictedPrice = mlPrice;
        }
      } catch (mlErr) {
        console.warn(`ML API unavailable (${mlErr.message}) — using rule-based price ₹${predictedPrice}`);
      }
    } else {
      console.log(`Rule-based price: ₹${predictedPrice} (${category}, ${condKey})`);
    }

    // ── Step 3: Save submission ──
    const docData = {
      userId,
      centerName: centerName || (isValidObjectId ? '' : `Center #${centerId}`),
      productName,
      productDescription,
      actionType,
      description,
      condition: condKey,
      predictedPrice,
    };
    if (isValidObjectId) docData.centerId = centerId;

    const rec = await RecycleSubmission.create(docData);
    await addPoints(userId, 20, "recycle");

    const actionText = actionType === 'recycle' ? 'Recycling' : 'Repair';
    return res.json({
      success: true,
      message: `${actionText} submission recorded! You earned 20 points.`,
      recycle: rec,
      pointsEarned: 20,
    });

  } catch (err) {
    console.error('Error in createRecycle:', err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// myRecycles
// ─────────────────────────────────────────────────────────────
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
