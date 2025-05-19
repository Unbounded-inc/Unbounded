import { useMemo } from "react";
import placeholder from "../../assets/placeholder.png";
import { type User } from "../../lib/UserContext";

interface ChatPreview {
  roomId: string;
  isGroup: boolean;
  groupName?: string;
  users?: User[];
  user?: User;
  members?: User[];
}

interface ChatSidebarProps {
  userId: string;
  chats: ChatPreview[];
  onSelectChat: (chat: ChatPreview) => void;
  onNewGroup: () => void;
  onNewDirectMessage: () => void;
}

function ChatSidebar({
                       userId,
                       chats,
                       onSelectChat,
                       onNewGroup,
                       onNewDirectMessage,
                     }: ChatSidebarProps) {
  const deduplicated = useMemo<ChatPreview[]>(() => {
    const map = new Map<string, ChatPreview>();

    chats.forEach((chat) => {
      const normalized: ChatPreview = {
        ...chat,
        members: chat.members || (
          chat.user
            ? [
              chat.user,
              {
                id: Number(userId),
                username: "You",
                email: "placeholder@example.com",
                is_anonymous: true,
              } as User
            ]
            : []
        ),
        user: chat.user || chat.members?.find((m) => m.id.toString() !== userId),
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
                  src={chat.user?.profile_picture || placeholder}
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
