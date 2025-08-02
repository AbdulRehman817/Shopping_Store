import mongoose from "mongoose";
import { ShoppingProducts } from "../models/product.models.js";
import { ShoppingOrder } from "../models/order.models.js";
const createOrder = async (req, res) => {
  try {
    const { userId, items, shippingInfo } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "User ID and cart items are required." });
    }

    if (!shippingInfo || typeof shippingInfo !== "object") {
      return res
        .status(400)
        .json({ message: "Shipping information is required." });
    }

    let totalAmount = 0;
    const stockUpdates = [];

    for (let i = 0; i < items.length; i++) {
      const { productId, quantity } = items[i];

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ message: `Invalid productId at index ${i}` });
      }

      const product = await ShoppingProducts.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found at index ${i}` });
      }

      if (typeof quantity !== "number" || quantity <= 0) {
        return res
          .status(400)
          .json({ message: `Invalid quantity at index ${i}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}".`,
        });
      }

      totalAmount += product.price * quantity;

      stockUpdates.push({
        productId,
        newStock: product.stock - quantity,
      });
    }

    const imageURL =
      items.length > 0
        ? (await ShoppingProducts.findById(items[0].productId))?.image
        : null;

    const order = await ShoppingOrder.create({
      userId,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      shippingInfo,
      status: "Pending",
      ImageURL: imageURL,
    });

    for (const update of stockUpdates) {
      await ShoppingProducts.findByIdAndUpdate(update.productId, {
        stock: update.newStock,
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await ShoppingOrder.find({ userId }).populate(
      "items.productId"
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get Orders by User ID Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Optional: Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch all orders with latest first
    const orders = await ShoppingOrder.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email") // to show user name/email
      .populate("items.productId", "name price"); // optional, for product info

    const totalOrders = await ShoppingOrder.countDocuments();

    res.status(200).json({
      message: "All orders fetched successfully",
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate input
    if (
      !status ||
      !["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    // Find and update order
    const order = await ShoppingOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createOrder, getOrdersByUserId, getAllOrders, updateOrderStatus };
