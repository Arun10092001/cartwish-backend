require("crypto"); // Ensure crypto is available globally for MongoDB driver
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();
require("./db/connectDB");

const app = express();
const PORT = process.env.PORT || 5000;

// import routes
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/category");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

// middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: "*",
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));

// basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Ensure upload directories exist (Render file system is ephemeral; consider S3 for persistence)
const uploads = [
  path.join(__dirname, "upload"),
  path.join(__dirname, "upload", "category"),
  path.join(__dirname, "upload", "profiles"),
  path.join(__dirname, "upload", "products"),
];
for (const dir of uploads) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.error("Could not create upload dir", dir, err);
  }
}

app.use(
  "/category",
  express.static(path.join(__dirname, "upload", "category")),
);
app.use("/profile", express.static(path.join(__dirname, "upload", "profiles")));
app.use(
  "/products",
  express.static(path.join(__dirname, "upload", "products")),
);

// health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// adding routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Mongo connection closed.");
      process.exit(0);
    });
  });
  // If still not closed after 10s, force exit
  setTimeout(() => {
    console.error("Forcing shutdown");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
