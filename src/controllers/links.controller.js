import Link from "../models/link.model.js";

// Crear link
export const createLink = async (req, res) => {
  try {
    const { url_destino, descripcion_link } = req.body;
    const img_link = req.file ? `/uploads/${req.file.filename}` : null;
    
    const count = await Link.countDocuments();

    //const newLink = new Link({ url_destino, descripcion_link, img_link });
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
