const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./config/db");
const cookieParser = require("cookie-parser");

// Route imports
const chatRoutes = require("./routes/chats");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const postRoutes = require("./routes/posts");
const forumRoutes = require("./routes/forums");
const commentRoutes = require("./routes/comments");
const eventRoutes = require("./routes/events");
const friendsRoutes = require("./routes/friends");

const app = express();
const server = http.createServer(app);

// WebSocket server config
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Debug DB connection info
console.log("Database connection info:", {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/forums", forumRoutes);
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat-rooms", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/uploads", express.static("uploads"));

// Socket.io setup
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`Registered user ${userId} to socket ${socket.id}`);
  });

  socket.on("send-message", async ({ senderId, roomId, content }) => {
    try {
      const result = await pool.query(
          `INSERT INTO messages (sender_id, room_id, content) VALUES ($1, $2, $3) RETURNING *`,
          [senderId, roomId, content]
      );

      const message = result.rows[0];

      const userResult = await pool.query(`SELECT username FROM users WHERE id = $1`, [senderId]);
      const sender_username = userResult.rows[0]?.username || "Unknown";

      const fullMessage = { ...message, sender_username };

      io.to(roomId).emit("receive-message", fullMessage);
      console.log(`Message broadcast to room ${roomId}`);
    } catch (err) {
      console.error("Error in send-message:", err);
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
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

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
