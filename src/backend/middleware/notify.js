let ioRef = null;
let userSocketMapRef = null;

function initSocketIO(io, userSocketMap) {
    ioRef = io;
    userSocketMapRef = userSocketMap;
}

function sendNotification(toUserId, message) {
    const socketId = userSocketMapRef[toUserId];
    console.log(`[sendNotification] Target user: ${toUserId}, socket: ${socketId}`);
    if (ioRef && socketId) {
        ioRef.to(socketId).emit("notification", {
            id: Date.now().toString(),
            message,
            timestamp: new Date().toISOString(),
        });
        console.log("[sendNotification] Notification sent!");
    } else {
        console.log("[sendNotification] Failed to send: No socket found for user.");
    }
}


module.exports = { initSocketIO, sendNotification };