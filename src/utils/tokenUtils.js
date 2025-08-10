import jwt from "jsonwebtoken";

export function generateAccessToken(admin) {
  return jwt.sign(
    { adminId: admin._id, role: "admin" },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(admin) {
  return jwt.sign(
    { adminId: admin._id, role: "admin" },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: "7d" }
  );
}
