import express from "express";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.js";
import {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
} from "../controllers/links.controller.js";
import path from "path";

// Configuración Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // carpeta uploads en la raíz del backend
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

const router = express.Router();

// CRUD Links
router.get("/", verifyToken, getLinks);
router.post("/", verifyToken, upload.single("img_link"), createLink);
router.put("/:id", verifyToken, upload.single("img_link"), updateLink);
router.delete("/:id", verifyToken, deleteLink);

export default router;
