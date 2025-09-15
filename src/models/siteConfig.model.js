import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema({
  homeBackgroundType: { type: String, enum: ["color", "image"], default: "color" },
  homeBackgroundValue: { type: String, default: "#d3d3d3" }, // color o imagen
  linkTreeBackgroundType: { type: String, enum: ["color", "image"], default: "color" },
  linkTreeBackgroundValue: { type: String, default: "#7a7a7aff" }, // color o imagen
  linkTreeBackgroundOpacity: { type: Number, default: 0.7 } // 👈 0.0 a 1.0
});

export default mongoose.model("SiteConfig", siteConfigSchema);
