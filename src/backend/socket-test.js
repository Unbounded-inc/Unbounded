const { io } = require("socket.io-client");

const socket = io("http://localhost:5001", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO!");
  socket.emit("register-user", "test-user-123");
  socket.emit("join-room", "room-abc");

  socket.emit("send-message", {
    roomId: "room-abc",
    message: {
      sender: "test-user-123",
      content: "Hello from test script!"
    }
  });
});

socket.on("receive-message", (msg) => {
  console.log("Message received:", msg);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
