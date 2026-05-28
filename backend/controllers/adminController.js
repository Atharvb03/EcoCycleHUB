import userModel from "../models/userModel.js";
import Reward from "../models/RewardModel.js";
import RecycleSubmission from "../models/RecycleSubmission.js";
import Center from "../models/centerModel.js";

// Helper: only true for 24-char hex ObjectId strings
const isObjectId = (val) => typeof val === 'string' && /^[a-f\d]{24}$/i.test(val);

// Get all users with their reward points (Admin only)
export const getAllUsersWithPoints = async (req, res) => {
  try {
    const users = await userModel.find().select("name email createdAt");

    const usersWithRewards = await Promise.all(
      users.map(async (user) => {
        const reward = await Reward.findOne({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          points: reward?.points || 0,
          level: reward?.level || "None",
          loginPoints: reward?.loginPoints || 0,
          orderPoints: reward?.orderPoints || 0,
          recyclePoints: reward?.recyclePoints || 0,
        };
      })
    );

    // Sort by points descending
    usersWithRewards.sort((a, b) => b.points - a.points);

    return res.json({ success: true, users: usersWithRewards });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all recycle/repair submissions with user details (Admin only)
export const getAllRecycleSubmissions = async (req, res) => {
  try {
    const submissions = await RecycleSubmission.find()
      .populate({ path: "userId", select: "name email", model: "user" })
      .sort({ createdAt: -1 });

    const populated = await Promise.all(submissions.map(async (sub) => {
      const obj = sub.toObject();
      const rawId = obj.centerId;
      if (isObjectId(String(rawId))) {
        const center = await Center.findById(rawId).select("name address city phone type");
        obj.centerId = center || null;
      } else {
        obj.centerId = null;
      }
      return obj;
    }));

    return res.json({ success: true, submissions: populated });
  } catch (error) {
    console.error("Error fetching recycle submissions:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// Get recycle/repair submissions for a specific user (Admin only)
export const getUserRecycleSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const submissions = await RecycleSubmission.find({ userId }).sort({ createdAt: -1 });

    const populated = await Promise.all(submissions.map(async (sub) => {
      const obj = sub.toObject();
      const rawId = obj.centerId;
      if (isObjectId(String(rawId))) {
        const center = await Center.findById(rawId).select("name address city phone type");
        obj.centerId = center || null;
      } else {
        obj.centerId = null;
      }
      return obj;
    }));

    const user = await userModel.findById(userId).select("name email");
    const reward = await Reward.findOne({ userId });

    return res.json({
      success: true,
      user: { _id: user?._id, name: user?.name, email: user?.email, points: reward?.points || 0, level: reward?.level || "None" },
      submissions: populated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all sellers pending Aadhaar review
export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await userModel.find({
      isSeller: true,
      aadhaarStatus: 'pending_review',
    }).select('name email mobile location profilePhoto aadhaarUrl aadhaarNumber createdAt');

    return res.json({ success: true, sellers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or reject a seller's Aadhaar
export const reviewSeller = async (req, res) => {
  try {
    const { sellerId, action } = req.body; // action: 'approve' | 'reject'

    const user = await userModel.findById(sellerId);
    if (!user) return res.json({ success: false, message: 'Seller not found' });

    if (action === 'approve') {
      user.sellerVerified = true;
      user.aadhaarStatus = 'approved';
      user.aadhaarVerified = true;
    } else {
      user.sellerVerified = false;
      user.aadhaarStatus = 'rejected';
      user.aadhaarVerified = false;
      user.aadhaarUrl = '';
    }

    await user.save();
    return res.json({ success: true, message: `Seller ${action}d successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
