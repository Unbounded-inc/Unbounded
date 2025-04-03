import React, { useState } from "react";
import "../../Styles/Messages.css";

interface NewChatModalProps {
  show: boolean;
  onClose: () => void;
  onSend: (username: string, message: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ show, onClose, onSend }) => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 5
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "300px"
        }}
      >
        <h2 style={{ color: "black", marginBottom: "10px" }}>Start New Chat</h2>

        <input
          type="text"
          className="textfield"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />

        <textarea
          className="share-input wide-input"
          placeholder="Type a message..."
          maxLength={280}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ height: "80px", width: "100%" }}
        />

        <div
          className="modal-buttons"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px"
          }}
        >
          <button
            className="register-button"
            style={{ padding: "10px", borderRadius: "5px", background: "#ccc" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="login-button"
            style={{
              padding: "10px",
              borderRadius: "5px",
              background: "#401f43",
              color: "white"
            }}
            onClick={() => onSend(username, message)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
