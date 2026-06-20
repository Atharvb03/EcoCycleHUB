// backend/server.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import centerRoutes from './routes/centerRoute.js';
import rewardRoutes from './routes/rewardRoutes.js'; // 
import recycleRouter from './routes/recycleRoute.js';
import adminRouter from './routes/adminRoute.js';
import sellerRouter from './routes/sellerRoute.js';


// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect to Database & Cloudinary
connectDB();
connectCloudinary();

// Middlewares

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ecocyclehub-green.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/centers', centerRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/recycle', recycleRouter); // 
app.use('/api/admin', adminRouter);
app.use('/api/seller', sellerRouter);
// Root endpoint
app.get('/', (req, res) => res.send('API Working'));

// Start server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
