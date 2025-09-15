import express from "express";
import Profile from "../models/profile.model.js";
import Link from "../models/link.model.js";

const router = express.Router();

// GET /api/public/home
router.get("/home", async (req, res) => {
  const profile = await Profile.findOne();
  const links = await Link.find().sort({ order: 1 });

  res.json({
    profile,
    links
  });
});
router.get("/click/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } }, // 👈 aumenta el contador
      { new: true }
    );
    if (!link) return res.status(404).json({ error: "Link no encontrado" });

    // redirige al destino
    res.redirect(link.url_destino);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
