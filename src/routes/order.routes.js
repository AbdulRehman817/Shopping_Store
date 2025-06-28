import express from "express";
import { createOrder,getAllOrders, getOrdersByUserId } from "../controllers/order.controllers.js";

const router = express.Router();

// POST /api/orders - Create a new order
router.post("/orders", createOrder);
router.get("/getAllOrders", getAllOrders);
router.get("/user/:userId", getOrdersByUserId);
    
export default router;
