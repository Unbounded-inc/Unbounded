const { io } = require("socket.io-client");

const socket = io("http://localhost:5001", {
  transports: ["websocket"]
});

const senderId = "f87db0ec-dc0a-4f7c-af23-57ba8946a0b4";
const receiverId = "5183f5aa-a36e-40a1-8073-f593d03698ea";

socket.on("connect", () => {
  console.log("Connected to Socket.IO server as", senderId);

  socket.emit("register", senderId);

  setTimeout(() => {
    const message = {
      senderId,
      receiverId,
      content: "testing test-socket",
    };

    socket.emit("send-message", message);
    console.log("Message sent:", message);
  }, 1000);
});


socket.on("receive-message", (msg) => {
  console.log("Message received:", msg);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
