import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

import userRoutes from "./src/routes/userRoutes.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);

// Create HTTP server
const server = http.createServer(app);
// Start server without MongoDB for now
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on ${process.env.PORT || 5000}`);
});

// Try to connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/cloutcloset")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
