
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const authMiddleware = async (req, res, next) => {
     const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "no token found" });

  const jwtToken = token.replace("Bearer ", "").trim();
  console.log("token from auth middleware", jwtToken);

  try {
    const isVerified = jwt.verify(jwtToken, process.env.ACCESS_JWT_SECRET);
    console.log("isVerified", isVerified);

    const userData = await User.findOne({ email: isVerified.email }).select({
      password: 0,
    });
    console.log(userData);
    req.user = userData; // Assigning userData to req.user
    req.token = token;
    next();
  } catch (error) {}
};

