import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { uploadImageToImageKit } from "../utils/imageKit.js";

const RegiserUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("🔵 Register request received with data:", { name, email });

  if (!name || !email || !password) {
    console.log("❌ Missing fields in register request");
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (!req.file) {
    console.log("❌ No image uploaded");
    return res.status(400).json({ message: "No image file uploaded" });
  }

  try {
    const imageUrl = await uploadImageToImageKit(req.file.path);
    console.log("📷 Image uploaded to Cloudinary:", imageUrl);

    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }



    const newUser = await User.create({
      name,
      email,
      password,
      image: imageUrl,
    });

    console.log("✅ User created:", newUser);

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("❌ Error in register route:", error);
    res.status(500).json({ message: "Internal server error during registration" });
  }
};

const generateAccessToken = (user) => {
  console.log("🔑 Generating access token for:", user.email);
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};

const generateRefreshToken = (user) => {
  console.log("🔁 Generating refresh token for:", user.email);
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

const LoginUser = async (req, res) => {
  const {email, password } = req.body;

  console.log("🟢 Login attempt for:", email);

  if ( !email || !password) {
    console.log("❌ Missing fields in login");
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User not found:", email);
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log("❌ Invalid password for:", email);
    return res.status(400).json({ message: "Invalid password" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });

  console.log("✅ User logged in:", email);

  return res.status(200).json({
    message: "User logged in successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};

const LogoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  console.log("🚪 User logged out");
  return res.status(200).json({ message: "User logged out successfully" });
};

const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    console.log("👤 Fetching profile for:", user?.email);
    res.json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log("❌ Error from user profile route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  console.log("♻️ Refresh token received:", token ? "Yes" : "No");

  if (!token)
    return res.status(401).json({ message: "No refresh token found!" });

  try {
    const decodedToken = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    console.log("🔓 Token verified:", decodedToken);

    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      console.log("❌ Invalid refresh token (no user found)");
      return res.status(404).json({ message: "Invalid token" });
    }

    const newAccessToken = generateAccessToken(user);
    console.log("✅ New access token generated");

    res.json({ message: "Access token generated", accessToken: newAccessToken });

  } catch (error) {
    console.log("❌ Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export {
  RegiserUser,
  LoginUser,
  LogoutUser,
  getUserProfile,
  refreshToken
};
