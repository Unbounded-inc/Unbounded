import React, { useRef, useState } from "react";
import icon from "../../assets/icon.png";
import "../../Styles/messages/Messages.css";
import SendMessage from "../../components/PageComponets/SendMessageButton";

interface Props {
  socket: any;
  senderId: string;
  roomId: string;
}

const MessageInput: React.FC<Props> = ({ socket, senderId, roomId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    const message = {
      senderId,
      roomId,
      content: text.trim(),
    };

    socket.emit("send-message", message);
    setText("");
  };

  return (
    <div className="message-box-wrapper">
      <textarea
        className="share-input wide-input"
        placeholder="Type a message..."
        maxLength={280}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <div className="button-row">
        <div className="file-upload-options">
          <img
            src={icon}
            alt="icon"
            className="photo-icon"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer" }}
          />
          <input type="file" ref={fileInputRef} style={{ display: "none" }} />
          <span className="photo-label" onClick={() => fileInputRef.current?.click()}>
            Photo
          </span>
        </div>

        <SendMessage onClick={handleSend} />
      </div>
    </div>
  );
};

export default MessageInput;

