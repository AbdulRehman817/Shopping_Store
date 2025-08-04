import { ShippingDetail } from "../models/shippingDetail.models.js";

// Create Shipping Detail
const createShippingDetail = async (req, res) => {
  try {
    const { userId, fullName, address, city, postalCode, country, phone } =
      req.body;

    const shipping = new ShippingDetail({
      userId,
      fullName,
      address,
      city,
      postalCode,
      country,
      phoneNumber,
    });

    const savedShipping = await shipping.save();
    res.status(201).json(savedShipping);
  } catch (error) {
    res.status(500).json({ message: "Failed to save shipping detail", error });
  }
};

// Get Shipping Details by User ID
const getShippingByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const shipping = await ShippingDetail.find({ userId });
    res.status(200).json(shipping);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch shipping details", error });
  }
};

export { createShippingDetail, getShippingByUser };
