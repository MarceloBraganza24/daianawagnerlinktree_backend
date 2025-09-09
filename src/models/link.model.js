// models/Link.js
import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  url_destino: { type: String, required: true },
  img_link: { type: String },
  descripcion_link: { type: String },
});

export default mongoose.model("Link", linkSchema);
