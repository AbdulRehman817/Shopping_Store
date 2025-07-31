// utils/uploadImageToImageKit.js
import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config(); // ✅ This must be called before using process.env

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Accept file buffer & originalname instead of filepath
export const uploadImageToImageKit = async (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const fileName = `user_${Date.now()}_${originalname}`;

    imagekit.upload(
      {
        file: fileBuffer, // ✅ buffer directly
        fileName,
        folder: "/uploads",
      },
      (error, result) => {
        if (error) {
          console.error("❌ ImageKit Upload Error:", error);
          reject(error);
        } else {
          console.log("✅ Uploaded to ImageKit:", result.url);
          resolve(result.url);
        }
      }
    );
  });
};
