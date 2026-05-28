import express from 'express';
import upload from '../middleware/multer.js';
import {
    registerSeller,
    verifyOTP,
    resendOTP,
    uploadProfilePhoto,
    uploadAadhaar,
    completeSeller,
    sellerLogin,
} from '../controllers/sellerController.js';

const sellerRouter = express.Router();

sellerRouter.post('/register', registerSeller);
sellerRouter.post('/verify-otp', verifyOTP);
sellerRouter.post('/resend-otp', resendOTP);
sellerRouter.post('/upload-photo', upload.single('profilePhoto'), uploadProfilePhoto);
sellerRouter.post('/upload-aadhaar', upload.single('aadhaar'), uploadAadhaar);
sellerRouter.post('/complete', completeSeller);
sellerRouter.post('/login', sellerLogin);

export default sellerRouter;
