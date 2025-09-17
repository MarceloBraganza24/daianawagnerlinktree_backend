import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID });
const bucket = storage.bucket(process.env.GCS_BUCKET);

export const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(Date.now() + "-" + file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
