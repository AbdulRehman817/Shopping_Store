import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
} from "../controllers/order.controllers.js";

const router = express.Router();

// POST /api/orders - Create a new order
router.post("/orders", createOrder);
router.get("/getAllOrders", getAllOrders);
router.get("/user/:userId", getOrdersByUserId);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
