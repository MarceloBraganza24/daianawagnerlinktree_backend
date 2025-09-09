// createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../src/models/admin.model.js";

dotenv.config({ path: "../.env.production" });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const username = "daianawagner";        // 🔹 cámbialo a lo que quieras
    const password = "1234";       // 🔹 cámbialo a lo que quieras

    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log("⚠️ El admin ya existe");
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });

    await newAdmin.save();
    console.log("✅ Admin creado con éxito:", username);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creando admin:", err);
    process.exit(1);
  }
};

createAdmin();
