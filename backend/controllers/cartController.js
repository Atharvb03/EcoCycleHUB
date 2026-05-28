import userModel from "../models/userModel.js";

// add products to user cart (userId from auth middleware)
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!itemId || !size) {
      return res.status(400).json({ success: false, message: "Item ID and size are required" });
    }

    const userData = await userModel.findById(userId);

    // ✅ Null check
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {}; // if undefined, initialize

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// update user cart (userId from auth middleware)
const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!itemId || !size || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "Item ID, size and numeric quantity are required" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get user cart data (userId from auth middleware via JWT)
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user from DB
    const user = await userModel.findById(userId);

    // Null check
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safe access to cartData (match frontend: success + cartData)
    const cartData = user.cartData || {};
    return res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Export all functions safely
export { addToCart, updateCart, getUserCart };
