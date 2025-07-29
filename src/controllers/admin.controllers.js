import { User } from "../models/user.models.js";
import { ShoppingOrder } from "../models/order.models.js";

// GET all users
const getAllUsers = async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
};

// GET all orders
const getAllOrders = async (req, res) => {
  const orders = await ShoppingOrder.find().populate("user", "name email");
  res.json(orders);
};

// PUT update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await ShoppingOrder.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json(order);
};

export { getAllUsers, getAllOrders, updateOrderStatus };
