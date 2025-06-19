import { Product } from "../models/product.models.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Upload Image Utility
const uploadImageToCloudinary = async (localPath) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    await fs.promises.unlink(localPath); // Clean up local file
    return result.url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    try {
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError.message);
    }
    return null;
  }
};

// Upload Image Route


// Create Product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        message: "All fields must be filled properly",
      });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        message: "This product already exists",
        existingProduct,
      });
    }

    if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  try {
    const imageUrl = await uploadImageToCloudinary(req.file.path);

    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ message: "Internal server error during upload" });
  }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Get All Products
const findAllProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "All products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Find All Product Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Get Single Product
const getSingleProduct = async (req, res) => {
  try {
    const singleProduct = await Product.findById(req.params.id);
    if (!singleProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: singleProduct,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export {
  getSingleProduct,
  findAllProduct,
  createProduct,
  uploadImage, // export this if you use it as a route
};
