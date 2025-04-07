import React, { useEffect, useState } from "react";
import "../../Styles/Feed.css";
import "../../Styles/Messages.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import MessageInput from "../../components/PageComponets/MessageInput";
import placeholder from "../../assets/placeholder.png";
import io from "socket.io-client";

interface User {
  id: string;
  username: string;
  profilePic?: string;
}

interface ChatPreview {
  roomId: string;
  user: User;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_username: string;
}

const socket = io("http://localhost:5001");

const Messages: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const selectedChat = chats.find((c) => c.roomId === selectedRoomId);

  const handleCloseChat = () => {
    setSelectedRoomId(null);
    setIsNewChat(false);
    setNewUsername("");
    setMessages([]);
  };

  useEffect(() => {
    const id = localStorage.getItem("auth0_id");

    if (id) {
      fetch(`http://localhost:5001/api/users/${id}`)
        .then((res) => res.json())
        .then((user) => {
          setCurrentUser(user);
          socket.emit("register-user", user.id);
        });
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    fetch(`http://localhost:5001/api/chat-rooms/${currentUser.id}`)
      .then((res) => res.json())
      .then(setChats);
  }, [currentUser]);

  useEffect(() => {
    if (!selectedRoomId) return;

    fetch(`http://localhost:5001/api/messages/${selectedRoomId}`)
      .then((res) => res.json())
      .then(setMessages);
  }, [selectedRoomId]);


  useEffect(() => {
    console.log("📨 startNewChat is defined");
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: any) => {
      console.log("📩 New message received:", message);

      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (socket && selectedRoomId) {
      socket.emit("join-room", selectedRoomId);
      console.log("🔌 Joined room:", selectedRoomId);
    }
  }, [socket, selectedRoomId]);


const startNewChat = async () => {
  try {
    if (!newUsername || !currentUser) {
      console.warn("⚠️ Either newUsername or currentUser is missing. Not making request.");
      return;
    }

    const userRes = await fetch(`http://localhost:5001/api/users/username/${newUsername}`);
    if (!userRes.ok) throw new Error("User not found");

    const receiver = await userRes.json();

    const roomRes = await fetch("http://localhost:5001/api/chat-rooms/one-on-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAId: currentUser.id,
        userBId: receiver.id,
      }),
    });

    if (!roomRes.ok) {
      const text = await roomRes.text();
      console.error("❌ Backend returned non-OK status:", roomRes.status, text);
      return;
    }

    const data = await roomRes.json();
    const roomId = data.roomId || data.room_id || data.id;

    if (!roomId) {
      console.error("❌ Room ID is missing from backend response");
      return;
    }

    setIsNewChat(false);
    setSelectedRoomId(roomId);
    setNewUsername("");

    if (!chats.find((c) => c.roomId === roomId)) {
      setChats((prev) => [...prev, { roomId, user: receiver }]);
    }

    console.log("✅ Room created:", roomId);
  } catch (err) {
    console.error("Error starting chat:", err);
    alert("Failed to start chat. Check the username.");
  }
};


  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content" style={{ display: "flex", padding: 0 }}>
        
        <div className="messages-sidebar">
          <h2 className="feed-header" style={{ fontSize: "32px", marginBottom: "0.5rem" }}>
            Messages
          </h2>

          <button className="new-chat-btn" onClick={() => { setIsNewChat(true); setSelectedRoomId(null); }}>
            <span className="plus">+</span> New Chat
          </button>



          {chats.map((chat) => (
            <div
              key={chat.roomId}
              onClick={() => {
                setSelectedRoomId(chat.roomId);
                setIsNewChat(false);
              }}
              className="chat-preview"
              style={{
                backgroundColor: selectedRoomId === chat.roomId && !isNewChat ? "#ddd" : "#e4e4e4",
              }}
            >
              <div className="post-header">
                <img src={chat.user.profilePic || placeholder} alt="Profile" className="profile-pic" />
                <div className="post-user">
                  <strong>{chat.user.username}</strong>
                  <p>@{chat.user.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-main">
          {!selectedRoomId && !isNewChat ? (
            <div className="empty-chat-msg">Select a conversation to start messaging</div>
          ) : isNewChat ? (
            <>
              <div className="chat-header" style={{ flexDirection: "column", gap: "0.75rem" }}>
                <div className="chat-header-top" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div className="post-user">
                    <strong>New Chat</strong>
                    <p>Enter a username to start messaging</p>
                  </div>
                  <div className="chat-close-wrapper">
                    <button className="close-btn" onClick={handleCloseChat}>✕</button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Enter username"
                  className="new-chat-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />

                <button className="start-chat-btn" onClick={startNewChat}>
                  Start Chat
                </button>
              </div>

              <div className="chat-messages" />
            </>
          ) : (
            <>
              <div className="chat-header">
                <div className="post-header">
                  <img src={selectedChat?.user.profilePic || placeholder} alt="Profile" className="profile-pic" />
                  <div className="post-user">
                    <strong>{selectedChat?.user.username}</strong>
                    <p>@{selectedChat?.user.username}</p>
                  </div>
                </div>
                <div className="chat-close-wrapper">
                  <button className="close-btn" onClick={handleCloseChat}>✕</button>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble ${msg.sender_id === currentUser?.id ? "sent" : "received"}`}>
                    <p><strong>{msg.sender_username}:</strong> {msg.content}</p>
                    <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentUser && selectedRoomId && !isNewChat && (
            <MessageInput
              socket={socket}
              senderId={currentUser.id}
              roomId={selectedRoomId}
            />

          )}
        </div>
      </main>

      <aside className="feed-right-panel">
        <div className="notification-panel">
          <h3>Notifications</h3>
          <p className="notification-item">Manny liked your post.</p>
          <p className="notification-item">Isabel commented on your post.</p>
          <p className="notification-item">New message from Calvin.</p>
        </div>
      </aside>
    </div>
  );
};

export default Messages;
