import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },

    // Seller verification fields
    isSeller: { type: Boolean, default: false },
    sellerVerified: { type: Boolean, default: false },
    profilePhoto: { type: String, default: '' },
    location: { type: String, default: '' },
    mobile: { type: String, default: '' },
    mobileVerified: { type: Boolean, default: false },
    aadhaarUrl: { type: String, default: '' },
    aadhaarNumber: { type: String, default: '' },  // stored masked: XXXX XXXX 1234
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarStatus: { type: String, default: 'none' }, // none | pending_review | approved | rejected

    // OTP (stored temporarily, expires in 10 min)
    otp: { type: String, default: '' },
    otpExpiry: { type: Date, default: null },
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
