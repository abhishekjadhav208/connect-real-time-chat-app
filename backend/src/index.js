import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

try {
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
} catch (e) {
  console.error("❌ Route loading error:", e.message);
}

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

console.log("🔥 Logging all routes...");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`[ROUTE] ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`[ROUTER] ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});