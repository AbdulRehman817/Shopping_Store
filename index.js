import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/index.js";
import adminRoute from "./src/routes/admin.routes.js";
import productRoute from "./src/routes/product.routes.js";
import cartRoute from "./src/routes/cart.routes.js";
import userRoute from "./src/routes/user.routes.js";
import orderRoute from "./src/routes/order.routes.js";
import ShippingDetail from "./src/routes/shippingDetail.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// ✅ Optional: Setup CORS options for local dev
const corsOptions = {
  origin: "https://shopping-store-frontend-chi.vercel.app",
  credentials: true,
};

http: app.use(express.json());
app.use(cors(corsOptions)); // ✅ CORRECT USAGE
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", productRoute);

app.use("/api/v1", cartRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", ShippingDetail);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed!", err);
  });
