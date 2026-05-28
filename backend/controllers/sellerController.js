import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── STEP 1: Register seller (basic info) ───────────────────────────────────
export const registerSeller = async (req, res) => {
    try {
        const { name, email, password, location, mobile } = req.body;

        if (!name || !email || !password || !location || !mobile) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "Email already registered" });

        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        if (!/^\d{10}$/.test(cleanMobile)) return res.json({ success: false, message: "Enter a valid 10-digit mobile number" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        const newUser = new userModel({
            name, email, password: hashedPassword,
            location, mobile: cleanMobile,
            isSeller: true,
            otp, otpExpiry,
        });

        const user = await newUser.save();

        // In production: send OTP via SMS (Twilio/MSG91). For now, return it in response for testing.
        console.log(`OTP for ${mobile}: ${otp}`);

        return res.json({
            success: true,
            userId: user._id,
            message: "OTP sent to your mobile number",
            // Remove next line in production:
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── STEP 2: Verify mobile OTP ───────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.otp || user.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (new Date() > user.otpExpiry) {
            return res.json({ success: false, message: "OTP expired. Please resend." });
        }

        user.mobileVerified = true;
        user.otp = '';
        user.otpExpiry = null;
        await user.save();

        return res.json({ success: true, message: "Mobile verified successfully" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── STEP 3: Resend OTP ──────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        console.log(`Resent OTP for ${user.mobile}: ${otp}`);

        return res.json({
            success: true,
            message: "OTP resent",
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── STEP 4: Upload profile photo ────────────────────────────────────────────
export const uploadProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) return res.json({ success: false, message: "No file uploaded" });

        const result = await cloudinary.uploader.upload(req.file.path, { folder: "sellers/profile" });

        await userModel.findByIdAndUpdate(userId, { profilePhoto: result.secure_url });

        return res.json({ success: true, profilePhoto: result.secure_url });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── STEP 5: Upload Aadhaar / ID ─────────────────────────────────────────────
export const uploadAadhaar = async (req, res) => {
    try {
        const { userId, aadhaarNumber } = req.body;
        if (!req.file) return res.json({ success: false, message: "No file uploaded" });

        // Validate Aadhaar number — must be exactly 12 digits
        const cleaned = (aadhaarNumber || '').replace(/\s+/g, '');
        if (!/^\d{12}$/.test(cleaned)) {
            return res.json({ success: false, message: "Invalid Aadhaar number. Must be exactly 12 digits." });
        }

        // Mask for privacy: XXXX XXXX 1234
        const masked = `XXXX XXXX ${cleaned.slice(8)}`;

        // Only accept image or PDF
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowed.includes(req.file.mimetype)) {
            return res.json({ success: false, message: "Only JPG, PNG or PDF files are accepted" });
        }

        // File size limit: 5MB
        if (req.file.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "File size must be under 5MB" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, { folder: "sellers/aadhaar" });

        await userModel.findByIdAndUpdate(userId, {
            aadhaarUrl: result.secure_url,
            aadhaarNumber: masked,   // store only masked version
            aadhaarStatus: 'pending_review',
        });

        return res.json({ success: true, aadhaarUrl: result.secure_url, maskedNumber: masked });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── STEP 6: Complete seller registration ────────────────────────────────────
export const completeSeller = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.mobileVerified) return res.json({ success: false, message: "Mobile not verified" });
        if (!user.profilePhoto) return res.json({ success: false, message: "Profile photo required" });
        if (!user.aadhaarUrl) return res.json({ success: false, message: "Aadhaar/ID upload required" });

        // Do NOT auto-approve — mark as pending admin review
        user.sellerVerified = false;
        user.aadhaarStatus = 'pending_review';
        await user.save();

        // No token issued yet — seller must wait for admin approval
        return res.json({
            success: true,
            pending: true,
            message: "Your documents have been submitted for review. You will be notified once approved.",
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// ─── Seller Login ─────────────────────────────────────────────────────────────
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email, isSeller: true });
        if (!user) return res.json({ success: false, message: "No seller account found with this email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        if (!user.sellerVerified) {
            const status = user.aadhaarStatus;
            if (status === 'rejected') {
                return res.json({
                    success: false,
                    status: 'rejected',
                    message: "Your account has been rejected. Please re-upload a valid Aadhaar / government-issued ID.",
                });
            }
            return res.json({
                success: false,
                status: 'pending',
                message: "Your seller account is pending verification",
                pendingUserId: user._id,
            });
        }

        const token = createToken(user._id);
        return res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
