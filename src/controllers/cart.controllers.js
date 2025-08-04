import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";

const createCart = async (req, res) => {
  const { user, items } = req.body;
  const loginUserId = req.user.id;

  // ✅ Check if the logged-in user is the same
  if (loginUserId !== user) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }

  // ✅ Check if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    // ✅ Check if a cart already exists
    let cart = await Cart.findOne({ user });

    // ❌ If no cart, create a new one
    if (!cart) {
      cart = new Cart({ user, items });
    } else {
      // */ 🔁 If cart exists, update it
      items.forEach((newItem) => {
        const existingItem = cart.items.find(
          (item) => item.productId.toString() === newItem.productId
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
    }

    // ✅ Save the cart
    await cart.save();

    return res.status(200).json({
      message: "Cart saved successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export { createCart };
