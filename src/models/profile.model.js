import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  nombreProfesional: { type: String, default: "" },
  descripcionProfesional: { type: String, default: "" },
  avatar: { type: String, default: "" }, // URL o path de la imagen
  aboutProfesional: { type: String, default: "" },
  aboutLinkId: { type: mongoose.Schema.Types.ObjectId, ref: "Link" }, 
});

export default mongoose.model("Profile", profileSchema);
