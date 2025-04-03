import React, { useRef, useState } from "react";
import icon from "../../assets/icon.png";
import "../../Styles/Messages.css";

const MessageInput: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      console.log("Sending:", text);
      setText("");
    }
  };

  return (
    <div className="message-box-wrapper">
      <textarea
        className="share-input wide-input"
        placeholder="Type a message..."
        maxLength={280}
        value={text}
        onChange={(e) => setText(e.target.value)}
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

        <button className="upload-btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
