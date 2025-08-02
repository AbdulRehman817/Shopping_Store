import express from "express";
import {
  registerUser,
  LoginUser,
  LogoutUser,
  getUserProfile,
  refreshToken,
} from "../controllers/user.controllers.js";

import { upload } from "../middleware/user.multer.js";
import { authMiddleware } from "../middleware/auth.middlware.js";

const router = express.Router();

router.post("/signup", upload.single("image"), registerUser);
router.post("/login", LoginUser);
router.post("/logout", LogoutUser);
router.post("/refreshToken", refreshToken);
router.get("/profile", authMiddleware, getUserProfile); // Apply middleware

export default router;
