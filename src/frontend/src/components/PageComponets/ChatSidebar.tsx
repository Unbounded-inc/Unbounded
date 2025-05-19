import placeholder from "../../assets/placeholder.png";
import { useMemo } from "react";

function ChatSidebar({ userId, chats, onSelectChat, onNewGroup, onNewDirectMessage }) {
  const deduplicated = useMemo(() => {
    const map = new Map();

    chats.forEach((chat) => {
      const normalized = {
        ...chat,
        members: chat.members || (
          chat.user ? [chat.user, { id: userId, username: "You" }] : []
        ),
        user: chat.user || chat.members?.find((m) => m.id !== userId),
      };
      map.set(chat.roomId, normalized);
    });

    return Array.from(map.values());
  }, [chats, userId]);

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

      {deduplicated.length === 0 ? (
        <div className="empty-chat-msg">No chats yet</div>
      ) : (
        deduplicated.map((chat) => (
          <div
            key={chat.roomId}
            className="chat-preview"
            onClick={() => onSelectChat(chat)}
          >
            {chat.isGroup ? (
              <div className="post-user">
                <strong>{chat.groupName || `Group (${chat.roomId.slice(0, 4)}…)`}</strong>
                <p>{chat.users?.map((u) => u?.username).sort().join(", ")}</p>
              </div>
            ) : (
              <div className="post-header">
                <img
                  src={chat.user?.profilePic || placeholder}
                  alt="Profile"
                  className="profile-pic"
                />
                <div className="post-user">
                  <strong>{chat.user?.username || "Unknown"}</strong>
                  <p>@{chat.user?.username || "unknown"}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ChatSidebar;
