import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  url_destino: { type: String, required: true },
  img_link: { type: String },
  descripcion_link: { type: String },
  clicks: { type: Number, default: 0 },
  order: { type: Number, default: 0 }, 
});

export default mongoose.model("Link", linkSchema);
