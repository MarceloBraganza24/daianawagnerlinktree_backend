import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: ".env.production" });

const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID });
const bucket = storage.bucket(process.env.GCS_BUCKET);

export const uploadToGCS = async (file) => {
  if (!file || !file.buffer) throw new Error("Archivo inválido");

  const fileName = `${Date.now()}-${file.originalname}`;
  const blob = bucket.file(fileName);

  try {
    // ✅ Generar URL firmada para subir
    const [url] = await blob.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000, // 5 minutos
      contentType: file.mimetype,
    });

    // ✅ Subir archivo con axios usando la URL firmada
    await axios.put(url, file.buffer, {
      headers: { "Content-Type": file.mimetype },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // ✅ Devolver URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return publicUrl;
  } catch (err) {
    console.error("❌ Error subiendo a GCS:", err.message);
    throw err;
  }
};

// ✅ Eliminar archivo viejo
export const deleteFromGCS = async (publicUrl) => {
  try {
    if (!publicUrl) return;

    const base = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(base, "");

    const file = bucket.file(filePath);
    await file.delete();

    console.log(`✅ Archivo eliminado de GCS: ${filePath}`);
  } catch (err) {
    console.warn("⚠️ Error eliminando archivo de GCS:", err.message);
  }
};

/* export const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(Date.now() + "-" + file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

// Borra archivo viejo
export const deleteFromGCS = async (publicUrl) => {
  try {
    if (!publicUrl) return;

    // extraer el path dentro del bucket
    const base = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(base, "");

    const file = bucket.file(filePath);
    await file.delete();

    console.log(`✅ Archivo eliminado de GCS: ${filePath}`);
  } catch (err) {
    console.warn("⚠️ Error eliminando archivo de GCS:", err.message);
  }
}; */
/* export const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Archivo no recibido"));
    if (!file.buffer) return reject(new Error("El archivo no tiene buffer (¿multer.memoryStorage?)"));

    const blob = bucket.file(`${Date.now()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("❌ Error en blobStream:", err);
      reject(err);
    });

    blobStream.on("finish", async () => {
      try {
        // opcional: hacer público automáticamente
        await blob.makePublic();
      } catch (e) {
        console.warn("⚠️ No se pudo hacer público el archivo:", e.message);
      }
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

// Borra archivo viejo
export const deleteFromGCS = async (publicUrl) => {
  try {
    if (!publicUrl) return;

    const base = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(base, "");
    const file = bucket.file(filePath);

    await file.delete();
    console.log(`✅ Archivo eliminado de GCS: ${filePath}`);
  } catch (err) {
    console.warn("⚠️ Error eliminando archivo de GCS:", err.message);
  }
}; */