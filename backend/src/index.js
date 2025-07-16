import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
console.log("✅ Routes registered:");
console.log("authRoutes:", typeof authRoutes); // should be function (middleware)
console.log("messageRoutes:", typeof messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
}


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    // ✅ Move the logger *here*
    if (app._router && app._router.stack) {
      console.log("🔥 Logging all registered routes:");
      app._router.stack.forEach((middleware) => {
        if (middleware.route && middleware.route.path) {
          const methods = Object.keys(middleware.route.methods)
            .map((m) => m.toUpperCase())
            .join(', ');
          console.log(`[ROUTE] ${methods} ${middleware.route.path}`);
        } else if (middleware.name === 'router' && middleware.handle.stack) {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              const methods = Object.keys(handler.route.methods)
                .map((m) => m.toUpperCase())
                .join(', ');
              console.log(`[ROUTER] ${methods} ${handler.route.path}`);
            }
          });
        }
      });
    } else {
      console.warn("⚠️ app._router or app._router.stack is not available (yet).");
    }
  });
});
