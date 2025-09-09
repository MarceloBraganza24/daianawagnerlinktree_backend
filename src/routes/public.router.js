// routes/public.js
import express from "express";
import Profile from "../models/profile.model.js";
import Link from "../models/link.model.js";

const router = express.Router();

// GET /api/public/home
router.get("/home", async (req, res) => {
  const profile = await Profile.findOne();
  const links = await Link.find();

  res.json({
    profile,
    links
  });
});

export default router;
