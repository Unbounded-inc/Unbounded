import React from "react";
import "../../Styles/messages/Messages.css";

interface SendMessageProps {
  onClick?: () => void;
}

const SendMessage: React.FC<SendMessageProps> = ({ onClick }) => {
  return (
    <button className="upload-btn" onClick={onClick}>
      Send
    </button>
  );
};

export default SendMessage;
