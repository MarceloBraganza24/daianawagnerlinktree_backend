/* import express from "express";
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
 */

import express from "express";
import multer from "multer";
import Profile from "../models/profile.model.js";
import Link from "../models/link.model.js";
import { verifyToken } from "../middlewares/auth.js";
import { uploadToGCS,deleteFromGCS } from "../utils/uploadToGCS.js";

const router = express.Router();

// Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// GET /api/profile
router.get("/", verifyToken, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
      return res.status(201).json(profile);
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error al obtener profile:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// PUT /api/profile
router.put("/", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    let profile = await Profile.findOne();
    let isNew = false;
    if (!profile) {
      profile = new Profile({});
      isNew = true;
    }

    // Validación de longitud
    const maxNombreLength = 100;
    const maxDescripcionLength = 500;

    const nombre = req.body.nombreProfesional?.trim();
    const descripcion = req.body.descripcionProfesional?.trim();
    const aboutProfesional = req.body.aboutProfesional?.trim();

    if (nombre && nombre.length > maxNombreLength)
      return res
        .status(400)
        .json({ message: `nombreProfesional no puede exceder ${maxNombreLength} caracteres` });

    if (descripcion && descripcion.length > maxDescripcionLength)
      return res
        .status(400)
        .json({ message: `descripcionProfesional no puede exceder ${maxDescripcionLength} caracteres` });

    // Actualización de campos de texto
    if (nombre) profile.nombreProfesional = nombre;
    if (descripcion) profile.descripcionProfesional = descripcion;
    if (aboutProfesional) profile.aboutProfesional = aboutProfesional;

    // Intentar subir avatar a GCS (no bloquea la actualización de texto)
    if (req.file) {
      try {

        const gcsUrl = await uploadToGCS(req.file);

        // si había una imagen previa, la borramos
        if (profile.avatar && profile.avatar.startsWith("https://storage.googleapis.com/")) {
          await deleteFromGCS(profile.avatar);
        }

        profile.avatar = gcsUrl;

      } catch (gcsError) {
        console.error("Error subiendo imagen a GCS:", gcsError);
        // Solo avisamos, no interrumpimos la actualización de texto
        res.locals.gcsError = "Error subiendo la imagen al servidor";
      }
    }

    // Crear o actualizar link "Sobre mí"
    if (aboutProfesional) {
      let aboutLink;
      if (profile.aboutLinkId) {
        // Si ya existe, actualizamos
        aboutLink = await Link.findById(profile.aboutLinkId);
        if (aboutLink) {
          aboutLink.img_link = profile.avatar;
          aboutLink.url_destino = "https://daianawagnerlinktree.web.app/aboutProfesional";
          //boutLink.url_destino = "http://localhost:5173/aboutProfesional";
          aboutLink.descripcion_link = "Sobre mí";
          await aboutLink.save();
        } else {
          // Si por alguna razón el link fue borrado, creamos uno nuevo
          aboutLink = new Link({
            img_link: profile.avatar,
            url_destino: "https://daianawagnerlinktree.web.app/aboutProfesional",
            //url_destino: "http://localhost:5173/aboutProfesional",
            descripcion_link: "Sobre mí",
          });
          await aboutLink.save();
          profile.aboutLinkId = aboutLink._id;
        }
      } else {
        // Si no existe link previo, lo creamos
        aboutLink = new Link({
          img_link: profile.avatar,
          url_destino: "https://daianawagnerlinktree.web.app/aboutProfesional",
          //url_destino: "http://localhost:5173/aboutProfesional",
          descripcion_link: "Sobre mí",
        });
        await aboutLink.save();
        profile.aboutLinkId = aboutLink._id;
      }
    }

    await profile.save();

    const statusCode = isNew ? 201 : 200;
    const response = { profile };
    if (res.locals.gcsError) response.gcsError = res.locals.gcsError;

    res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error actualizando profile:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;

