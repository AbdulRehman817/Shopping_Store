import mongoose from "mongoose";
import { ShoppingProducts } from "../models/product.models.js";
import { uploadImageToImageKit } from "../utils/imageKit.js";

// ! Create Product Controller
const createProduct = async (req, res) => {
  try {
    // * Request body se required fields nikaal rahe hain
    const { name, description, price, type, team, color, stock } = req.body;

    // TODO: Check karo ke koi field empty na ho
    if (!name || !description || !price || !type || !team || !color || !stock) {
      return res.status(400).json({
        message: "All fields must be filled properly",
      });
    }

    // * Check karo ke same name ka product already database mein to nahi
    const existingProduct = await ShoppingProducts.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        message: "This product already exists",
        existingProduct,
      });
    }

    // ! Check karo image file upload hui hai ya nahi
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // * ImageKit ke zariye image ko upload kar rahe hain
    const imageUrl = await uploadImageToImageKit(req.file.path);

    // ! Agar image upload fail ho jaye
    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // * Sab kuch theek hai to product create karo database mein
    const product = await ShoppingProducts.create({
      name,
      description,
      price,
      type,
      team,
      color,
      stock,
      image: imageUrl,
    });

    // ✅ Success response
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// ! Get All Products
const findAllProduct = async (req, res) => {
  try {
    // * Sab products ko database se fetch karo
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

// ! Get Single Product by ID
const getSingleProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  try {
    // * `req.params.id` se product ID milta hai URL se
    const singleProduct = await ShoppingProducts.findById(id);

    console.log("Single Product:", singleProduct);

    // ! Agar product nahi mila to error do
    if (!singleProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Success response
    res.status(200).json({
      message: "Product retrieved successfully",
      product: singleProduct,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
const getProductByCategory = async (req, res) => {
  try {
    const teamName = req.params.team;

    // ✅ Find all products that match the team name
    const products = await ShoppingProducts.find({ team: teamName });

    // ❗ If no products found
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this team" });
    }

    // ✅ Success response
    res.status(200).json({
      message: "Products retrieved successfully",
      products: products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// * Exporting all product controllers
export {
  getSingleProduct,
  findAllProduct,
  createProduct,
  getProductByCategory,
};
