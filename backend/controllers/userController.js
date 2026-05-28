import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { addPoints } from "./rewardController.js";
import Reward from "../models/RewardModel.js";
import orderModel from "../models/orderModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    // ✅ No reward points on regular login
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    // 🎁 Give 10 points only on new signup
    await addPoints(user._id, 10, "login");

    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Get logged-in user's profile + rewards + recent orders
const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const user = await userModel
      .findById(userId)
      .select("name email createdAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let reward = await Reward.findOne({ userId });
    if (!reward) {
      reward = await Reward.create({ userId, points: 0 });
    }

    const recentOrders = await orderModel
      .find({ userId })
      .sort({ date: -1 })
      .limit(5);

    return res.json({
      success: true,
      user,
      rewards: {
        points: reward.points || 0,
        level: reward.level || "Bronze",
        loginPoints: reward.loginPoints || 0,
        orderPoints: reward.orderPoints || 0,
        recyclePoints: reward.recyclePoints || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password — generate OTP and "send" it (logged to console in dev)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "No account found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // In production replace with real email service
    console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);

    return res.json({ success: true, message: "OTP sent to your email", devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset password — verify OTP then set new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.otp || user.otp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.otpExpiry < new Date()) return res.json({ success: false, message: "OTP expired, request a new one" });
    if (newPassword.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = '';
    user.otpExpiry = null;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, getMe, forgotPassword, resetPassword };