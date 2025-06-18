import mongoose from "mongoose";
import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";

const createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "User ID and items are required" });
    }

    let totalAmount = 0;

    // Validate each item and calculate totalAmount
    for (let i = 0; i < items.length; i++) {
      const { productId, quantity } = items[i];

      // Check if productId is valid
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: `Invalid productId at index ${i}` });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found at index ${i}` });
      }

      // Validate quantity
      if (typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity at index ${i}` });
      }

      // Add to total
      totalAmount += product.price * quantity;
    }

    // Create the order
    const order = await Order.create({
      userId,
      items,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export { createOrder };
