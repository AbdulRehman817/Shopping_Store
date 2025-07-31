import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  updateUser,
} from "../controllers/admin.controllers.js";
import adminMiddleware from "../middleware/admin.middleware.js";

router.get("/users", adminMiddleware, getAllUsers);
router.get("/orders", adminMiddleware, getAllOrders);
router.put("/orders/:id", adminMiddleware, updateOrderStatus);
router.put("/user/:id",adminMiddleware, updateUser);

export default router;
