
import express from "express";
import {
 getSingleProduct,
  findAllProduct,
  createProduct,
//   uploadImage,
} from "../controllers/product.controllers.js";

import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// Add a new best deal product
router.post("/addProduct", upload.single("image"), createProduct);

// Edit an existing best deal product


// Get all best deal products
router.get("/getProduct", findAllProduct);



// router.get("/products/category/:categoryName", getProductsByCategory);

export default router;
