import { ShoppingProducts } from "../models/product.models.js";

import { uploadImageToImageKit } from "../utils/imageKit.js";



// Create Product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        message: "All fields must be filled properly",
      });
    }

    const existingProduct = await ShoppingProducts.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        message: "This product already exists",
        existingProduct,
      });
    }

    if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  
    const imageUrl = await uploadImageToImageKit(req.file.path);

    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

   
  

    const product = await ShoppingProducts.create({
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
    const products = await ShoppingProducts.find();
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
    const singleProduct = await ShoppingProducts.findById(req.params.id);
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
  
};
