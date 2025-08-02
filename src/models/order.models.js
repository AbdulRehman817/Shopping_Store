import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shippingInfo: {
      fullName: { type: String, required: true },
      email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"],
      },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNumber: {
        type: String, // Changed to String to preserve leading 0s
        required: true,
      },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ShoppingProducts",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    shippedAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

export const ShoppingOrder =
  mongoose.models.ShoppingOrder || mongoose.model("ShoppingOrder", orderSchema);
