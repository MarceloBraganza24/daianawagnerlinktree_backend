/* import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

fs.access(process.env.GOOGLE_APPLICATIsiON_CREDENTIALS, fs.constants.R_OK, (err) => {
  if (err) {
    console.error("No se puede leer el archivo JSON:", err);
  } else {
    console.log("Archivo JSON existe y se puede leer ✅");
  }
});
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("GCS_BUCKET:", process.env.GCS_BUCKET);
console.log("GCS_PROJECT_ID:", process.env.GCS_PROJECT_ID);
