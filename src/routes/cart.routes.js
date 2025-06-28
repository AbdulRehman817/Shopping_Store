import express from "express";
import { createCart } from "../controllers/cart.controllers.js";
import {authMiddleware} from "../middleware/auth.middlware.js"

const router = express.Router();

// Route: POST /api/cart/create
// Purpose: Create or update a cart
// Middleware: authMiddleware (can be optional or required based on your logic)
router.post("/create", authMiddleware, createCart);

export default router;
