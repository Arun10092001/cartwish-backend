const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE;

if (!mongoUri || typeof mongoUri !== "string") {
  throw new Error(
    "Missing MongoDB URI. Set process.env.MONGODB_URI or process.env.DATABASE in your environment."
  );
}

console.log("DATABASE =", mongoUri);

mongoose
  .connect(mongoUri, {})
  .then(() => console.log("DB Connected..."))
  .catch((err) => console.log("DB Connection Error :", err));
