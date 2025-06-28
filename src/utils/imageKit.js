// utils/uploadImageToImageKit.js
import ImageKit from "imagekit";
import fs from "fs";

const imagekit = new ImageKit({
  publicKey: "public_LoJS188L35l2G4/IyNhiN7d+76c=",
  privateKey: "private_xNjkODSWw4NCMqaCcvq+5TCuhos=",
  urlEndpoint: "https://ik.imagekit.io/ksb0pukrm",
});

export const uploadImageToImageKit = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.readFileSync(filePath);
    const fileName = `user_${Date.now()}.jpg`;

    imagekit.upload(
      {
        file: fileStream, // required
        fileName: fileName, // required
        folder: "/user_profiles",
      },
      function (error, result) {
        if (error) {
          console.error("❌ ImageKit Upload Error:", error);
          reject(error);
        } else {
          console.log("📷 Uploaded to ImageKit:", result.url);
          resolve(result.url);
        }
      }
    );
  });
};
