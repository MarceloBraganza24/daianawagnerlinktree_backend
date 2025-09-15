import express from "express";
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
