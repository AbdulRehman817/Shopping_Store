import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { uploadImageToImageKit } from "../utils/imageKit.js";

// ! Register User Controller
// const RegiserUser = async (req, res) => {
//   const { name, email, password } = req.body;

//   console.log("🔵 Register request received with data:", { name, email });

//   // TODO: Check if koi field missing to error return karo
//   if (!name || !email || !password) {
//     console.log("❌ Missing fields in register request");
//     return res.status(400).json({ message: "Please fill all fields" });
//   }

//   // ! Image bhi zaroori hai registration ke liye
//   if (!req.file) {
//     console.log("❌ No image uploaded");
//     return res.status(400).json({ message: "No image file uploaded" });
//   }

//   try {
//     // * ImageKit ke through image upload
//     const imageUrl = await uploadImageToImageKit(req.file.path);
//     console.log("📷 Image uploaded to Cloudinary:", imageUrl);

//     if (!imageUrl) {
//       return res.status(500).json({ message: "Image upload failed" });
//     }

//     // * Check karo user pehle se register hai ya nahi
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log("⚠️ User already exists:", email);
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // * Naya user create karo
//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       image: imageUrl,
//     });

//     console.log("✅ User created:", newUser);

//     return res.status(201).json({
//       message: "User registered successfully",
//       user: newUser,
//     });
//   } catch (error) {
//     console.error("❌ Error in register route:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error during registration" });
//   }
// };

const RegisterUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("🔵 Register request:", { name, email, role });

  // 1. Field validation
  if (!name || !email || !password || !role) {
    console.log("❌ Missing registration fields");
    return res.status(400).json({ message: "Please fill all fields" });
  }
  if (!["user", "admin"].includes(role)) {
    console.log("❌ Invalid role:", role);
    return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
  }
  if (!req.file) {
    console.log("❌ No image uploaded");
    return res.status(400).json({ message: "Please upload a profile image" });
  }

  try {
    // 2. Upload image
    const imageUrl = await uploadImageToImageKit(req.file.path);
    if (!imageUrl) {
      console.log("❌ Image upload failed");
      return res.status(500).json({ message: "Image upload failed" });
    }
    console.log("📷 Image uploaded:", imageUrl);

    // 3. Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ User already exists:", email);
      return res.status(409).json({ message: "User already exists" });
    }

    // 4. Hash password

    // 5. Create user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      image: imageUrl,
    });
    console.log("✅ New user created:", newUser._id);

    // 6. Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // 7. Set refreshToken cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Return response
    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
};

// * Access Token generate karne wala function
const generateAccessToken = (user) => {
  const secret = process.env.ACCESS_JWT_SECRET;
  if (!secret) throw new Error("ACCESS_JWT_SECRET is not set");

  console.log("🔑 Generating access token for:", user.email);

  return jwt.sign({ email: user.email, userId: user._id.toString() }, secret, {
    expiresIn: "6h",
  });
};

// * Refresh Token generate karne wala function
const generateRefreshToken = (user) => {
  const secret = process.env.REFRESH_JWT_SECRET;
  if (!secret) throw new Error("REFRESH_JWT_SECRET is not set");

  console.log("🔁 Generating refresh token for:", user.email);

  return jwt.sign({ email: user.email, userId: user._id.toString() }, secret, {
    expiresIn: "7d",
  });
};

// ! Login User Controller
const LoginUser = async (req, res) => {
  const { email, password, role } = req.body;

  console.log("🟢 Login attempt for:", email);

  // TODO: Field check karo
  if (!email || !password || !role) {
    console.log("❌ Missing fields in login");
    return res.status(400).json({ message: "Please fill all fields" });
  }

  // * Check karo user exist karta hai ya nahi
  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User not found:", email);
    return res.status(400).json({ message: "User not found" });
  }

  // * Password verify karo
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log("❌ Invalid password for:", email);
    return res.status(400).json({ message: "Invalid password" });
  }
  if (user.role !== role) {
    return res.status(403).json({ message: `Access denied for ${role}` });
  }
  // * Tokens generate karo
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // * Refresh token ko cookie mein save karo
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });

  console.log("✅ User logged in:", email);
  console.log("data", user);
  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);
  return res.status(200).json({
    message: "User logged in successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};
// const LoginUser = async (req, res) => {
//   const { email, password, role } = req.body;

//   if (!email || !password || !role) {
//     return res.status(400).json({ message: "Please fill all fields" });
//   }

//   const user = await User.findOne({ email });

//   if (!user) {
//     return res.status(400).json({ message: "User not found" });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return res.status(400).json({ message: "Invalid password" });
//   }

//   if (user.role !== role) {
//     return res.status(403).json({ message: `Access denied for ${role}` });
//   }

//   const accessToken = generateAccessToken(user);
//   const refreshToken = generateRefreshToken(user);

//   res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });

//   return res.status(200).json({
//     message: "User logged in successfully",
//     accessToken,
//     refreshToken,
//     data: {
//       email: user.email,
//       role: user.role,
//     },
//   });
// };

// ! Logout Controller
const LogoutUser = async (req, res) => {
  // * Refresh token cookie clear karo
  res.clearCookie("refreshToken");
  console.log("🚪 User logged out");
  return res.status(200).json({ message: "User logged out successfully" });
};

// ! User Profile Controller
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

// ! Refresh Token Handler
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  console.log("♻️ Refresh token received:", token ? "Yes" : "No");

  if (!token)
    return res.status(401).json({ message: "No refresh token found!" });

  try {
    // * Token verify karo
    const decodedToken = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    console.log("🔓 Token verified:", decodedToken);

    // * Email se user dhoondo
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      console.log("❌ Invalid refresh token (no user found)");
      return res.status(404).json({ message: "Invalid token" });
    }

    // * New access token generate karo
    const newAccessToken = generateAccessToken(user);
    console.log("✅ New access token generated");

    res.json({
      message: "Access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("❌ Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log("❌ Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// * Exporting all controllers
export {
  RegisterUser,
  LoginUser,
  LogoutUser,
  getUserProfile,
  refreshToken,
  getAllUsers,
};
