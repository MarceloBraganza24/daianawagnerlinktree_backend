/* import Link from "../models/link.model.js";

// Crear link
export const createLink = async (req, res) => {
  try {
    const { url_destino, descripcion_link } = req.body;
    const img_link = req.file ? `/uploads/${req.file.filename}` : null;
    
    const count = await Link.countDocuments();

    const newLink = new Link({
      url_destino,
      descripcion_link,
      img_link,
      order: count, // 👈 lo pone al final
    });
    await newLink.save();

    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar link
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_destino, descripcion_link } = req.body;
    // solo actualizar img_link si se sube un archivo
    const img_link = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedData = { url_destino, descripcion_link };
    if (img_link) updatedData.img_link = img_link;

    const link = await Link.findByIdAndUpdate(id, updatedData, { new: true });
    if (!link) return res.status(404).json({ error: "Link no encontrado" });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const link = await Link.findByIdAndDelete(id);
        if (!link) return res.status(404).json({ error: "Link no encontrado" });
        res.json({ message: "Link eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ order: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 */
import Link from "../models/link.model.js";
import { uploadToGCS,deleteFromGCS } from "../utils/uploadToGCS.js";

// Validaciones
const MAX_DESC_LENGTH = 300;
const MAX_URL_LENGTH = 2048;

// GET /api/links
export const getLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ order: 1 });
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener links" });
  }
};

// POST /api/links
export const createLink = async (req, res) => {
  try {
    const { url_destino, descripcion_link } = req.body;

    // Validaciones
    if (!url_destino || url_destino.length > MAX_URL_LENGTH)
      return res.status(400).json({ error: "URL inválida o demasiado larga" });
    if (descripcion_link && descripcion_link.length > MAX_DESC_LENGTH)
      return res
        .status(400)
        .json({ error: `La descripción no puede superar ${MAX_DESC_LENGTH} caracteres` });

    let img_link = null;
    if (req.file) {
      try {
        img_link = await uploadToGCS(req.file);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al subir la imagen" });
      }
    }

    const count = await Link.countDocuments();
    const newLink = new Link({
      url_destino,
      descripcion_link,
      ...(img_link && { img_link }),
      order: count,
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear link" });
  }
};

/* // PUT /api/links/:id
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_destino, descripcion_link } = req.body;

    // Validaciones
    if (url_destino && url_destino.length > MAX_URL_LENGTH)
      return res.status(400).json({ error: "URL demasiado larga" });
    if (descripcion_link && descripcion_link.length > MAX_DESC_LENGTH)
      return res
        .status(400)
        .json({ error: `La descripción no puede superar ${MAX_DESC_LENGTH} caracteres` });

    let img_link;
    if (req.file) {
      try {
        img_link = await uploadToGCS(req.file);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al subir la imagen" });
      }
    }

    const updatedData = { url_destino, descripcion_link };
    if (img_link) updatedData.img_link = img_link;

    const link = await Link.findByIdAndUpdate(id, updatedData, { new: true });
    if (!link) return res.status(404).json({ error: "Link no encontrado" });

    res.status(200).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar link" });
  }
}; */
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_destino, descripcion_link } = req.body;

    // Validaciones
    if (url_destino && url_destino.length > MAX_URL_LENGTH)
      return res.status(400).json({ error: "URL demasiado larga" });
    if (descripcion_link && descripcion_link.length > MAX_DESC_LENGTH)
      return res
        .status(400)
        .json({ error: `La descripción no puede superar ${MAX_DESC_LENGTH} caracteres` });

    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ error: "Link no encontrado" });

    let img_link = link.img_link; // valor por defecto: lo que ya tenía

    if (req.file) {
      try {
        // Subir nueva imagen
        const newImg = await uploadToGCS(req.file);

        // Si había imagen anterior → borrarla
        if (img_link && img_link.startsWith("https://storage.googleapis.com/")) {
          await deleteFromGCS(img_link);
        }

        img_link = newImg;
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al subir la imagen" });
      }
    }

    // Actualizar campos
    link.url_destino = url_destino ?? link.url_destino;
    link.descripcion_link = descripcion_link ?? link.descripcion_link;
    link.img_link = img_link;

    await link.save();

    res.status(200).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar link" });
  }
};

// DELETE /api/links/:id
/* export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findByIdAndDelete(id);
    if (!link) return res.status(404).json({ error: "Link no encontrado" });

    res.status(200).json({ message: "Link eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar link" });
  }
}; */
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ error: "Link no encontrado" });

    // Borrar imagen de Cloud Storage si existe
    if (link.img_link && link.img_link.startsWith("https://storage.googleapis.com/")) {
      try {
        await deleteFromGCS(link.img_link);
      } catch (err) {
        console.warn("⚠️ No se pudo borrar imagen en GCS:", err.message);
      }
    }

    await link.deleteOne(); // borra el documento de Mongo

    res.status(200).json({ message: "Link eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar link" });
  }
};
