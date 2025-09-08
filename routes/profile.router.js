import express from "express";
import multer from "multer";
import path from "path";
import Profile from "../models/Profile.js";

const router = express.Router();

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único
  },
});

const upload = multer({ storage });

// Obtener perfil
router.get("/", async (req, res) => {
  const profile = await Profile.findOne();
  res.json(profile);
});

// Actualizar perfil
router.put("/", upload.single("avatar"), async (req, res) => {
  let profile = await Profile.findOne();
  if (!profile) profile = new Profile();

  profile.name = req.body.name;
  profile.description = req.body.description;

  if (req.file) {
    profile.avatar = `/uploads/${req.file.filename}`;
  }

  await profile.save();
  res.json(profile);
});

export default router;
