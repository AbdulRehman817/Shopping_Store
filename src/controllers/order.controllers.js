import mongoose from "mongoose";
import { ShoppingProducts } from "../models/product.models.js";
import { ShoppingOrder } from "../models/order.models.js";

const createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "User ID and items are required" });
    }

    let totalAmount = 0;
 // To hold updated stock changes before applying
    const stockUpdates = [];

    // Validate each item and calculate totalAmount
    for (let i = 0; i < items.length; i++) {
      const { productId, quantity } = items[i];

      // Check if productId is valid
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: `Invalid productId at index ${i}` });
      }

      
      // Check if product exists
      const product = await ShoppingProducts.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found at index ${i}` });
      }



      
      // Validate quantity
      if (typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity at index ${i}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${quantity}`,
        });
      }

      // Add to total
      totalAmount += product.price * quantity;
       stockUpdates.push({
        productId,
        newStock: product.stock - quantity,
      });
    
    }
    const imageURL = items.length > 0 ? (await ShoppingProducts.findById(items[0].productId))?.image : null;


    // Create the order
    const order = await ShoppingOrder.create({
      userId,
      items,
      totalAmount,
     ImageURL: imageURL

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


const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

   const orders = await ShoppingOrder.find({ userId }).populate("items.productId");

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


export { createOrder,getOrdersByUserId,getAllOrders };
