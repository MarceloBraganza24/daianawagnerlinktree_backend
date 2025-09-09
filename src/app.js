// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.router.js";
import profileRoutes from "./routes/profile.router.js";
import linksRoutes from "./routes/links.router.js";
import publicRoutes from "./routes/public.router.js";

dotenv.config({ path: ".env.production" });

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Servir imágenes de /uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/public", publicRoutes);

// Conexión a Mongo y arranque
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log("Servidor en puerto " + (process.env.PORT))
    );
  })
  .catch((err) => console.error(err));
