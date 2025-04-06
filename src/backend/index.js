const express = require("express");
const axios = require("axios");
const cors = require("cors");
require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages"); 
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log("Database connection info:", {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const userSocketMap = {}; 

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`Registered user ${userId} to socket ${socket.id}`);
  });

  socket.on("send-message", async ({ senderId, receiverId, content }) => {
    try {
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content]
      );
      const message = result.rows[0];

      const recipientSocketId = userSocketMap[receiverId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive-message", message);
        console.log(`Message delivered to ${receiverId}`);
      }
    } catch (err) {
      console.error("Error in send-message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
