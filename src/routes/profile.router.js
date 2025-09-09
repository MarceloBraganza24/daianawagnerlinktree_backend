// routes/profile.js
import express from "express";
import multer from "multer";
import path from "path";
import Profile from "../models/profile.model.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Configuración de multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// GET /api/profile (protegido)
router.get("/", verifyToken, async (req, res) => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create({});
  }
  res.json(profile);
});

// PUT /api/profile (protegido, recibe FormData)
router.put("/", verifyToken, upload.single("avatar"), async (req, res) => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = new Profile({});
  }

  profile.nombreProfesional = req.body.nombreProfesional || profile.nombreProfesional;
  profile.descripcionProfesional = req.body.descripcionProfesional || profile.descripcionProfesional;

  if (req.file) {
    profile.avatar = `/uploads/${req.file.filename}`;
  }

  await profile.save();
  res.json(profile);
});

export default router;
