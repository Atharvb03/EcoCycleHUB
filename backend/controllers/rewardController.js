import Reward from "../models/RewardModel.js";
import userModel from "../models/userModel.js";
import RecycleSubmission from "../models/RecycleSubmission.js";

// Auto-level logic (based on total points)
// 0–49:    None
// 50–99:   Bronze
// 100–199: Silver
// 200+:    Gold
const getLevel = (points) => {
  if (points >= 200) return "Gold";
  if (points >= 100) return "Silver";
  if (points >= 50) return "Bronze";
  return "None";
};

// GET logged-in user's rewards
export const getMyRewards = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let reward = await Reward.findOne({ userId });

    if (!reward) {
      reward = await Reward.create({ userId });
    }

    return res.json({
      userId: reward.userId,
      points: reward.points,
      level: reward.level,
      loginPoints: reward.loginPoints || 0,
      orderPoints: reward.orderPoints || 0,
      recyclePoints: reward.recyclePoints || 0
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ⭐ CENTRAL FUNCTION — USE EVERYWHERE
export const addPoints = async (userId, value, source = "other") => {
  let reward = await Reward.findOne({ userId });

  if (!reward) {
    reward = await Reward.create({ userId });
  }

  reward.points += value;

  if (source === "login") {
    reward.loginPoints += value;
  } else if (source === "order") {
    reward.orderPoints += value;
  } else if (source === "recycle") {
    reward.recyclePoints += value;
  }

  reward.level = getLevel(reward.points);

  await reward.save();
};

// GET public leaderboard — all users sorted by points
export const getLeaderboard = async (req, res) => {
  try {
    // Get all users + all rewards, then merge
    const [allUsers, allRewards] = await Promise.all([
      userModel.find().select("_id name email"),
      Reward.find()
    ]);

    const rewardMap = {};
    allRewards.forEach(r => { rewardMap[r.userId.toString()] = r; });

    const leaderboard = allUsers.map(user => {
      const r = rewardMap[user._id.toString()];
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        points: r ? r.points : 0,
        level: r ? r.level : "None",
        loginPoints: r ? (r.loginPoints || 0) : 0,
        orderPoints: r ? (r.orderPoints || 0) : 0,
        recyclePoints: r ? (r.recyclePoints || 0) : 0,
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);

    return res.json({ success: true, leaderboard });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET recycle history for a specific user (public — used in leaderboard modal)
export const getUserRecycleHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await RecycleSubmission.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, submissions });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
