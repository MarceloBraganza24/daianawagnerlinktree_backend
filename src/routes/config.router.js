/* import express from "express";
import multer from "multer";
import path from "path";
import SiteConfig from "../models/siteConfig.model.js";
import { hexToRgba } from "../utils/colors.js";

const router = express.Router();

// Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Obtener config
router.get("/", async (req, res) => {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = new SiteConfig({
      homeBackgroundType: "color",
      homeBackgroundValue: "lightgray",
      linkTreeBackground: "",
    });
    await config.save();
  }
  res.json(config);
});

// Actualizar config
router.post("/", upload.fields([
  { name: "homeBackgroundImage", maxCount: 1 },
  { name: "linkTreeBackgroundImage", maxCount: 1 },
]), async (req, res) => {
  const {
    homeBackgroundType,
    homeBackgroundColor,
    linkTreeBackgroundType,
    linkTreeBackgroundColor,
    linkTreeBackgroundOpacity,
  } = req.body;

  let config = await SiteConfig.findOne();
  if (!config) config = new SiteConfig();

  // Fondo home
  config.homeBackgroundType = homeBackgroundType;
  if (homeBackgroundType === "color") config.homeBackgroundValue = homeBackgroundColor;
  else if (req.files["homeBackgroundImage"]?.[0])
    config.homeBackgroundValue = "/uploads/" + req.files["homeBackgroundImage"][0].filename;

  // Fondo linktree
  config.linkTreeBackgroundType = linkTreeBackgroundType;
  if (linkTreeBackgroundType === "color") {
    config.linkTreeBackgroundValue = linkTreeBackgroundColor;
    config.linkTreeBackgroundOpacity = parseFloat(linkTreeBackgroundOpacity) || 0.7; 
  } else if (req.files["linkTreeBackgroundImage"]?.[0]) {
    config.linkTreeBackgroundValue = "/uploads/" + req.files["linkTreeBackgroundImage"][0].filename;
  }

  await config.save();
  res.json(config);
});



export default router;
 */
import express from "express";
import multer from "multer";
import SiteConfig from "../models/siteConfig.model.js";
import { hexToRgba } from "../utils/colors.js";
import { uploadToGCS,deleteFromGCS } from "../utils/uploadToGCS.js";

const router = express.Router();

// Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// GET /api/config
router.get("/", async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({
        homeBackgroundType: "color",
        homeBackgroundValue: "lightgray",
        linkTreeBackgroundType: "color",
        linkTreeBackgroundValue: "#7a7a7aff",
        linkTreeBackgroundOpacity: 0.7,
      });
      await config.save();
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la configuración" });
  }
});

// POST /api/config
router.post(
  "/",
  upload.fields([
    { name: "homeBackgroundImage", maxCount: 1 },
    { name: "linkTreeBackgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        homeBackgroundType,
        homeBackgroundColor,
        linkTreeBackgroundType,
        linkTreeBackgroundColor,
        linkTreeBackgroundOpacity,
      } = req.body;

      let config = await SiteConfig.findOne();
      if (!config) config = new SiteConfig();

      // Fondo home
      config.homeBackgroundType = homeBackgroundType;
      if (homeBackgroundType === "color") {
        config.homeBackgroundValue = homeBackgroundColor;
      } else if (req.files["homeBackgroundImage"]?.[0]) {
        try {
          // Borrar imagen anterior si existe
          if (config.homeBackgroundValue?.startsWith("https://storage.googleapis.com/")) {
            await deleteFromGCS(config.homeBackgroundValue);
          }

          const gcsUrl = await uploadToGCS(req.files["homeBackgroundImage"][0]);
          config.homeBackgroundValue = gcsUrl;
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: "Error al subir la imagen de home" });
        }
      }

      // Fondo linktree
      config.linkTreeBackgroundType = linkTreeBackgroundType;
      if (linkTreeBackgroundType === "color") {
        config.linkTreeBackgroundValue = linkTreeBackgroundColor;
        //config.linkTreeBackgroundOpacity = parseFloat(linkTreeBackgroundOpacity) || 0.7;
        config.linkTreeBackgroundOpacity =
          linkTreeBackgroundOpacity !== undefined
            ? parseFloat(linkTreeBackgroundOpacity)
            : 0.7;
      } else if (req.files["linkTreeBackgroundImage"]?.[0]) {
        try {
          // Borrar imagen anterior si existe
          if (config.linkTreeBackgroundValue?.startsWith("https://storage.googleapis.com/")) {
            await deleteFromGCS(config.linkTreeBackgroundValue);
          }

          const gcsUrl = await uploadToGCS(req.files["linkTreeBackgroundImage"][0]);
          config.linkTreeBackgroundValue = gcsUrl;
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: "Error al subir la imagen de linktree" });
        }
      }

      await config.save();
      res.status(200).json(config);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar la configuración" });
    }
  }
);

export default router;
