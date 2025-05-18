import React, { useEffect, useState, useRef } from "react";
import "../../Styles/Feed.css";
import "../../Styles/Messages.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import MessageInput from "../../components/PageComponets/MessageInput";
import CreateGroupModal from "../../components/PageComponets/CreateGroupModal";
import placeholder from "../../assets/placeholder.png";
import io from "socket.io-client";
import CreateDMModal from "../../components/PageComponets/CreateDMModal";

interface User {
  id: string;
  username: string;
  profilePic?: string;
}

interface ChatPreview {
  roomId: string;
  isGroup: boolean;
  groupName?: string;
  users?: User[];
  user?: User;
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
  const [showGroupModal, setShowGroupModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDMModal, setShowDMModal] = useState(false);


  const selectedChat = chats.find((c) => c.roomId === selectedRoomId) || null;

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
      .then((data) => Array.isArray(data) && setChats(data));
  }, [currentUser]);

  useEffect(() => {
    if (!selectedRoomId) return;
    fetch(`http://localhost:5001/api/messages/${selectedRoomId}`)
      .then((res) => res.json())
      .then(setMessages);
  }, [selectedRoomId]);

  useEffect(() => {
    const handler = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("receive-message", handler);
    return () => socket.off("receive-message", handler);
  }, []);

  useEffect(() => {
    if (socket && selectedRoomId) {
      socket.emit("join-room", selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = async () => {
    try {
      if (!newUsername || !currentUser) return;

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

      const data = await roomRes.json();
      const roomId = data.roomId || data.room_id || data.id;

      if (roomId) {
        setIsNewChat(false);
        setSelectedRoomId(roomId);
        setNewUsername("");
        if (!chats.find((c) => c.roomId === roomId)) {
          setChats((prev) => [...prev, { roomId, isGroup: false, user: receiver }]);
        }
      } else {
        alert("Failed to start chat.");
      }
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
          <h2 className="feed-header">Messages</h2>
          <button className="new-chat-btn" onClick={() => setShowDMModal(true)}>
            <span className="plus">+</span> New Chat
          </button>

          <button className="new-chat-btn" onClick={() => { setShowGroupModal(true); setSelectedRoomId(null); }}>
            <span className="plus">+</span> New Group Chat
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
              {chat.isGroup ? (
                <div className="post-user">
                  <strong>{chat.groupName || "Group Chat"}</strong>
                  <p>{chat.users?.map((u) => u.username).join(", ")}</p>
                </div>
              ) : (
                <div className="post-header">
                  <img src={chat.user?.profilePic || placeholder} alt="Profile" className="profile-pic" />
                  <div className="post-user">
                    <strong>{chat.user?.username || "Unknown"}</strong>
                    <p>@{chat.user?.username || "unknown"}</p>
                  </div>
                </div>
              )}
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
                <button className="start-chat-btn" onClick={startNewChat}>Start Chat</button>
              </div>
              <div className="chat-messages" />
            </>
          ) : (
            <>
              <div className="chat-header">
                <div className="post-header">
                  <img src={selectedChat?.user?.profilePic || placeholder} alt="Profile" className="profile-pic" />
                  <div className="post-user">
                    <strong>{selectedChat?.user?.username || selectedChat?.groupName}</strong>
                    <p>{selectedChat?.user?.username ? `@${selectedChat.user.username}` : "Group Chat"}</p>
                  </div>
                </div>
                <div className="chat-close-wrapper">
                  <button className="close-btn" onClick={handleCloseChat}>✕</button>
                </div>
              </div>

              <div className="chat-messages">
                {(() => {
                  const groups = [];
                  let lastSenderId: string | null = null;
                  let currentGroup: Message[] = [];

                  for (const msg of messages) {
                    if (msg.sender_id !== lastSenderId) {
                      if (currentGroup.length > 0) groups.push(currentGroup);
                      currentGroup = [msg];
                      lastSenderId = msg.sender_id;
                    } else {
                      currentGroup.push(msg);
                    }
                  }
                  if (currentGroup.length > 0) groups.push(currentGroup);

                  return groups.map((group, i) => {
                    const isCurrentUser = group[0].sender_id === currentUser?.id;
                    return (
                      <div key={i} className={`message-group ${isCurrentUser ? "sent" : "received"}`} style={{ marginBottom: "1rem" }}>
                        <p className="sender-name" style={{ color: "#666", fontWeight: "600", marginBottom: "4px" }}>
                          {isCurrentUser ? "You" : group[0].sender_username}
                        </p>
                        {group.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              backgroundColor: isCurrentUser ? "#2f45c5" : "#555",
                              color: "#fff",
                              padding: "10px",
                              borderRadius: "10px",
                              marginBottom: "4px",
                              maxWidth: "70%",
                              alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                            }}
                          >
                            {msg.content}
                            <span
                              className="timestamp"
                              style={{
                                color: "#bbb",
                                fontSize: "0.75rem",
                                display: "block",
                                marginTop: "4px",
                                textAlign: "right",
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}

          {currentUser && selectedRoomId && !isNewChat && (
            <MessageInput socket={socket} senderId={currentUser.id} roomId={selectedRoomId} />
          )}
        </div>
      </main>

      {showGroupModal && currentUser && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          currentUserId={currentUser.id}
          onGroupCreated={(roomId) => {
            fetch(`http://localhost:5001/api/chat-rooms/${currentUser.id}`)
              .then((res) => res.json())
              .then((updatedChats) => {
                if (Array.isArray(updatedChats)) {
                  setChats(updatedChats);
                  setSelectedRoomId(roomId);
                  setShowGroupModal(false);
                }
              });
          }}
        />
      )}

      {showDMModal && currentUser && (
        <CreateDMModal
          currentUserId={currentUser.id}
          onClose={() => setShowDMModal(false)}
          onChatStarted={(roomId) => {
            setSelectedRoomId(roomId);
            setShowDMModal(false);
          }}
        />
      )}

    </div>
  );
};

export default Messages;
