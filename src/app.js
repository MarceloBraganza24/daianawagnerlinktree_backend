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
import configRoutes from "./routes/config.router.js";

dotenv.config({ path: ".env.production" });

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = [
  "https://daianawagnerlinktree.web.app", // URL de tu frontend en Firebase
  "http://localhost:5173" // Para desarrollo local con Vite
];
app.use(cors({
  origin: function(origin, callback) {
    // permitir requests sin origin (como curl o Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El CORS para este origen (${origin}) no está permitido`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // si usás cookies o auth
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/config", configRoutes);

// Conexión a Mongo y arranque
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log("Servidor en puerto " + (process.env.PORT))
    );
  })
  .catch((err) => console.error(err));
