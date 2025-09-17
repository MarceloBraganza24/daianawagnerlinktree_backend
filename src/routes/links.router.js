/* import express from "express";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.js";
import {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
} from "../controllers/links.controller.js";
import path from "path";
import Link from "../models/link.model.js";

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
router.put("/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body; // array de IDs en nuevo orden
    await Promise.all(
      orderedIds.map((id, index) =>
        Link.findByIdAndUpdate(id, { order: index })
      )
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/:id", verifyToken, upload.single("img_link"), updateLink);


router.delete("/:id", verifyToken, deleteLink);

export default router;
 */

import express from "express";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.js";
import {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
} from "../controllers/links.controller.js";
import Link from "../models/link.model.js";

const router = express.Router();

// ⚡ Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// CRUD Links
router.get("/", verifyToken, getLinks);
router.post("/", verifyToken, upload.single("img_link"), createLink);
router.put("/reorder", verifyToken, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
      return res.status(400).json({ error: "orderedIds debe ser un array" });

    await Promise.all(
      orderedIds.map((id, index) =>
        Link.findByIdAndUpdate(id, { order: index })
      )
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reordenar links" });
  }
});
router.put("/:id", verifyToken, upload.single("img_link"), updateLink);
router.delete("/:id", verifyToken, deleteLink);

export default router;
