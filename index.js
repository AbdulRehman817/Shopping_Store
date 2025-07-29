import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "../src/db/index.js";
import adminRoute from "../src/routes/admin.routes.js";
import productRoute from "../src/routes/product.routes.js";
import cartRoute from "../src/routes/cart.routes.js";
import userRoute from "../src/routes/user.routes.js";
import orderRoute from "../src/routes/order.routes.js";
import ShippingDetail from "../src/routes/shippingDetail.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";

const app = express();

const corsOptions = {
  origin: ["https://shopping-store-frontend-ltnp.vercel.app"],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from Vercel serverless!");
});

app.use("/api/v1", productRoute);
app.use("/api/v1", cartRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", ShippingDetail);

// ✅ Only connect MongoDB once
await connectDB();

export const handler = serverless(app);
