// backend/models/RecycleSubmission.js
import mongoose from "mongoose";

const recycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    centerId: { type: mongoose.Schema.Types.Mixed, ref: "Center", required: false },
    centerName: { type: String }, // fallback for manual/non-DB centers
    productName: { type: String, required: true },
    productDescription: { type: String },
    actionType: { type: String, enum: ['recycle', 'repair'], required: true },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good' },
    predictedPrice: { type: Number },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    pointsAwarded: { type: Number, default: 20 },
    description: String,              // e.g. "3 old t‑shirts" (kept for backward compatibility)
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("RecycleSubmission", recycleSchema);