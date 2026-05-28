import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Allows access if token belongs to a verified seller OR the hardcoded admin
const sellerAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Hardcoded admin token (string, not object) — let it through
        if (typeof decoded === 'string') {
            return next();
        }

        // Regular JWT — must be a verified seller
        const user = await userModel.findById(decoded.id);
        if (!user || !user.isSeller || !user.sellerVerified) {
            return res.json({ success: false, message: 'Not Authorized. Seller verification required.' });
        }

        req.userId = decoded.id;
        req.sellerId = decoded.id;  // alias used by seller-scoped endpoints
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default sellerAuth;
