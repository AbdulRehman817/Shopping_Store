import { ShoppingOrder } from "../models/order.models.js";
import { User } from "../models/user.models.js";
import { ShoppingProducts } from "../models/product.models.js";
import mongoose from "mongoose";

const getMonthName = (m) =>
  new Date(0, m, 1).toLocaleString("default", { month: "short" });

export const getAdminStats = async (req, res) => {
  const [totalUsers, totalOrders, revData] = await Promise.all([
    User.countDocuments(),
    ShoppingOrder.countDocuments(),
    ShoppingOrder.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const totalRevenue = revData[0]?.total || 0;

  const monthly = await ShoppingOrder.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthlyRevenue = monthly.map((m) => ({
    month: getMonthName(m._id - 1),
    revenue: m.total,
  }));

  const salesByProduct = await ShoppingOrder.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "prod",
      },
    },
    { $unwind: "$prod" },
    { $project: { productName: "$prod.name", totalSold: 1 } },
    { $sort: { totalSold: -1 } },
  ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email createdAt");

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue,
    monthlyRevenue,
    salesByProduct,
    recentUsers,
  });
};
