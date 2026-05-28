import express from 'express'
import {
  placeOrder, placeOrderStripe, placeOrderRazorpay,
  allOrders, sellerOrders,
  userOrders, updateStatus,
  verifyStripe, verifyRazorpay
} from '../controllers/orderController.js'
import sellerAuth from '../middleware/sellerAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin — all orders
orderRouter.post('/list', sellerAuth, allOrders)
orderRouter.post('/status', sellerAuth, updateStatus)

// Seller-scoped — only their products' orders
orderRouter.post('/seller/list', sellerAuth, sellerOrders)

// Payment
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter
