// middleware/user.multer.js
import multer from "multer";

// Use memory storage so we can upload directly to ImageKit
const storage = multer.memoryStorage();

export const upload = multer({ storage });
