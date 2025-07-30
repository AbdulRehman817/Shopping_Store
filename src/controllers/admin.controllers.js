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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, image } = req.body;

    // Check if the requester is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.image = image || user.image;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getAllUsers, getAllOrders, updateOrderStatus, updateUser };
