import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import statusRoutes from "./routes/status.routes.js";
import translateRoutes from "./routes/translate.routes.js";

import { connectDB } from "./lib/db.js";
import { initializeFirebase } from "./config/firebase.js";
import { fileURLToPath } from "url";
import fs from "fs";

// Initialize Firebase Admin SDK
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 5001;

// Get correct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Handle favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/translate", translateRoutes);

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, "../../frontend/dist");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  console.log("✅ Frontend static files served from:", frontendDistPath);
} else {
  console.error("❌ Frontend dist folder not found at:", frontendDistPath);
  console.log("💡 Run: npm run build --prefix frontend");
}

// Handle client-side routing - serve index.html for all non-API routes
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.originalUrl.startsWith("/api/")) {
    return next();
  }

  const indexPath = path.join(frontendDistPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error("index.html not found at:", indexPath);
    res.status(404).send(`
      <h1>Frontend not built</h1>
      <p>Please run: <code>npm run build --prefix frontend</code></p>
      <p>Looking for: ${indexPath}</p>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// 404 handler for API routes only
app.use("/api/*", (req, res) => {
  console.log(`404 - API Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "API route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
