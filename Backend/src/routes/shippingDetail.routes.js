import express from "express";
import {
  createShippingDetail,
  getShippingByUser,
} from "../controllers/shippingDetail.controllers.js";

const router = express.Router();

router.post("/shipping", createShippingDetail);
router.get("/shipping/:userId", getShippingByUser);

export default router;
