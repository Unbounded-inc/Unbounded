import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { type User } from "../../../lib/UserContext";
import "./Messages.css";

const socket = io(import.meta.env.VITE_BACKEND_URL);

interface Message {
  sender_id?: string;
  senderId?: string;
  receiverId: string;
  content: string;
}

interface ChatProps {
  currentUser: User;
  receiverId: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser, receiverId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentUser?.id || !receiverId) return;

    fetch(`/api/messages/${currentUser.id}/${receiverId}`)
      .then((res) => res.json())
      .then(setMessages)
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser?.id, receiverId]);

  useEffect(() => {
    socket.emit("register", currentUser.id);

    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [currentUser?.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const msg: Message = {
        senderId: currentUser.id.toString(),
        receiverId,
        content: message,
      };

      socket.emit("send-message", msg);
      setMessages((prev) => [...prev, { ...msg, sender_id: currentUser.id.toString() }]);
      setMessage("");
    }
  };

  return (
    <div className="chat-main">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-msg">No messages yet</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`post ${
                msg.sender_id?.toString() === currentUser.id.toString() ||
                msg.senderId?.toString() === currentUser.id.toString()
                  ? "sent"
                  : ""
              }`}
            >
              {msg.content}
            </div>

          ))
        )}
        <div ref={messageEndRef}/>
      </div>

      <div className="message-box-wrapper">
        <textarea
          className="new-chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <div className="button-row">
          <button className="photo-label" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
