import React, { useState } from "react";
import "../../Styles/Feed.css";
import "../../Styles/Messages.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import MessageInput from "../../components/PageComponets/MessageInput";
import placeholder from "../../assets/placeholder.png";

const mockChats = [
  {
    id: 1,
    name: "Esperanza Rising",
    username: "@thatonepersonfromthebook",
    message: "Hey! How’s it going?",
    profilePic: placeholder,
  },
  {
    id: 2,
    name: "Romeo Santos",
    username: "@guyfromaventura",
    message: "Hola, qué tal?",
    profilePic: placeholder,
  },
  {
    id: 3,
    name: "Luna Park",
    username: "@moonmagic",
    message: "Let's link soon!",
    profilePic: placeholder,
  },
];

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const handleCloseChat = () => {
    setSelectedChat(null);
    setIsNewChat(false);
    setNewUsername("");
  };

  const selected = mockChats.find((c) => c.id === selectedChat);

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content" style={{ display: "flex", padding: 0 }}>
        {/* Left Chat List */}
        <div className="messages-sidebar">
          <h2 className="feed-header" style={{ fontSize: "32px", marginBottom: "0.5rem" }}>
            Messages
          </h2>

          <button
            className="upload-btn full-width"
            style={{ marginBottom: "1.5rem", width: "100%" }}
            onClick={() => {
              setIsNewChat(true);
              setSelectedChat(null);
            }}
          >
            + New Chat
          </button>

          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                setIsNewChat(false);
              }}
              className="chat-preview"
              style={{
                backgroundColor: selectedChat === chat.id && !isNewChat ? "#ddd" : "#e4e4e4",
              }}
            >
              <div className="post-header">
                <img src={chat.profilePic} alt="Profile" className="profile-pic" />
                <div className="post-user">
                  <strong>{chat.name}</strong>
                  <p>{chat.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Display */}
        <div className="chat-main">
          {!selectedChat && !isNewChat ? (
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
                    <button className="close-btn" onClick={handleCloseChat}>
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Enter username"
                  className="new-chat-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div className="chat-messages" />

              <MessageInput />
            </>
          ) : (
            <>
              <div className="chat-header">
                <div className="post-header">
                  <img src={selected?.profilePic} alt="Profile" className="profile-pic" />
                  <div className="post-user">
                    <strong>{selected?.name}</strong>
                    <p>{selected?.username}</p>
                  </div>
                </div>
                <div className="chat-close-wrapper">
                  <button className="close-btn" onClick={handleCloseChat}>
                    ✕
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                <div className="post">{selected?.message}</div>
                <div className="post sent">I'm good! Just got back from work.</div>
              </div>

              <MessageInput />
            </>
          )}
        </div>
      </main>

      {/* Right Panel */}
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
