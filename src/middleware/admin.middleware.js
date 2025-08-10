import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Authorization Header:", req.headers.authorization); // ✅

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    console.log("Decoded token:", decoded); // ✅

    const user = await User.findById(decoded.userId);
    console.log("User from DB:", user); // ✅

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Middleware Error:", err.message); // ✅
    res.status(401).json({ message: "Not authorized" });
  }
};

export default adminMiddleware;
