import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import { addPoints } from "./rewardController.js";

// global variables
const currency = "inr";
const deliveryCharge = 10;

// ── Lazy gateway initialization ──────────────────────────────
// Prevents crash at startup when keys are not set (e.g. on Render free tier)
let _stripe = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY env var is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID) throw new Error("RAZORPAY_KEY_ID env var is not set");
    _razorpay = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// ======================= COD ORDER =======================
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    await addPoints(userId, 20, "order");

    return res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ======================= STRIPE ORDER =======================
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await getStripe().checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ======================= STRIPE VERIFY =======================
const verifyStripe = async (req, res) => {
  const { orderId, success } = req.body;
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      await addPoints(userId, 20, "order");
      return res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ======================= RAZORPAY ORDER =======================
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await getRazorpay().orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ======================= RAZORPAY VERIFY =======================
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const orderInfo = await getRazorpay().orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true }, { new: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      await addPoints(userId, 20, "order");
      return res.json({ success: true, message: "Payment Successful" });
    } else {
      return res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ======================= ADMIN =======================
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ======================= SELLER ORDERS =======================
const sellerOrders = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const sellerProducts = await productModel.find({ sellerId }).select('_id');
    const sellerProductIds = new Set(sellerProducts.map(p => p._id.toString()));

    const orders = await orderModel.find({});
    const filtered = orders
      .map(order => {
        const sellerItems = order.items.filter(item =>
          sellerProductIds.has(item._id?.toString() || item.id?.toString())
        );
        if (!sellerItems.length) return null;
        return { ...order.toObject(), items: sellerItems };
      })
      .filter(Boolean);

    res.json({ success: true, orders: filtered });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= USER ORDERS =======================
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const orders = await orderModel.find({ userId });
    return res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ======================= UPDATE STATUS =======================
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay, verifyStripe,
  placeOrder, placeOrderStripe, placeOrderRazorpay,
  allOrders, sellerOrders,
  userOrders, updateStatus,
};
