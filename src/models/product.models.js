import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    team: {
      type: String,
    },
    color: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);
export const ShoppingProducts = mongoose.model(
  "ShoppingProducts",
  productSchema
);
