import { useEffect, useState } from "react";

function ChatSidebar({ userId, onSelectChat, onNewGroup, onNewDirectMessage }) {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    async function loadChats() {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat-rooms/${userId}`, {
        credentials: "include",
      });
      const data = await response.json();
      setChatRooms(data);
    }
    if (userId) {
      loadChats();
    }
  }, [userId]);

  return (
    <div className="messages-sidebar">
      <div className="new-chat-buttons">
        <button className="new-chat-btn" onClick={onNewDirectMessage}>
          <span className="plus">+</span> New Chat
        </button>

        <button className="new-chat-btn" onClick={onNewGroup}>
          <span className="plus">+</span> New Group Chat
        </button>
      </div>




      {chatRooms.length === 0 ? (
        <div className="empty-chat-msg">No chats yet</div>
      ) : (
        chatRooms.map((room) => (
          <div key={room.roomId} className="chat-preview" onClick={() => onSelectChat(room)}>
            {room.isGroup ? (
              <span>Group: {room.groupName}</span>
            ) : (
              <span>Chat with {room.members[0]?.username}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ChatSidebar;
