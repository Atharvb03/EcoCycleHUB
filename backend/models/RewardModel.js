import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    points: {
      type: Number,
      default: 0
    },
    // Breakdown buckets
    loginPoints: {
      type: Number,
      default: 0
    },
    orderPoints: {
      type: Number,
      default: 0
    },
    recyclePoints: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      default: "None"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Reward", rewardSchema);
