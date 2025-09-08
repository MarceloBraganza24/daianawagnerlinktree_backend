// models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: String,
  description: String,
  avatar: String // URL relativa (ej: "/uploads/123456.jpg")
});

export default mongoose.model("Profile", profileSchema);
