import dotenv from "dotenv"
dotenv.config();
import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from "path";

import { connectDb } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { server,io } from "./lib/socket.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))
app.use(cookieParser());

const PORT=process.env.PORT;


app.use(express.json({ limit: '10mb' }));
app.use("/api/auth",authRoutes);
app.use("/api/messages", messageRoutes);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.on("request", app);

server.listen(PORT,()=>{
    console.log("running "+PORT)
    connectDb()
})

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});
