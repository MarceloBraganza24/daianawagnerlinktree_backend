import express from "express";
import path from "path";

const app = express();

// Para servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));