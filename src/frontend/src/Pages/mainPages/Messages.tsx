import React, { useEffect, useState, useRef } from "react";
import "../../Styles/Feed.css";
import "../../Styles/Messages.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import MessageInput from "../../components/PageComponets/MessageInput";
import CreateGroupModal from "../../components/PageComponets/CreateGroupModal";
import CreateDMModal from "../../components/PageComponets/CreateDMModal";
import placeholder from "../../assets/placeholder.png";
import { useUser } from "../../lib/UserContext";
import io from "socket.io-client";
import ChatSidebar from "../../components/PageComponets/ChatSidebar";

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
  message_count?: number | string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_username: string;
}

function normalizeAndDeduplicateChats(chats: ChatPreview[], currentUserId?: string): ChatPreview[] {
  const seen = new Set<string>();
  const uniqueChats: ChatPreview[] = [];

  chats.forEach((chat) => {
    const userIds = chat.users?.map((u) => u.id).sort().join(",") || "";
    const dedupeKey = `${chat.roomId}:${userIds}`;

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      uniqueChats.push({
        ...chat,
        users: chat.isGroup ? chat.users : undefined,
        user: !chat.isGroup
          ? chat.user || chat.users?.find((u) => u.id !== currentUserId)
          : undefined,
      });
    }
  });

  return uniqueChats;
}

const Messages: React.FC = () => {
  const { user: currentUser } = useUser();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [lastCreatedRoomId, setLastCreatedRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  const selectedChat = chats.find((c) => c.roomId === selectedRoomId) || null;

  const handleCloseChat = () => {
    setSelectedRoomId(null);
    setIsNewChat(false);
    setNewUsername("");
    setMessages([]);
  };

  const loadChats = () => {
    if (!currentUser) return;
    fetch(`http://localhost:5001/api/chat-rooms/${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        const visible = data.filter((chat) => {
          return (
            !chat.isGroup ||
            Number(chat.message_count) > 0 ||
            chat.roomId === lastCreatedRoomId
          );
        });

        // Sort by lastMessageAt descending (newest first)
        visible.sort((a, b) => {
          const aTime = new Date(a.lastMessageAt || 0).getTime();
          const bTime = new Date(b.lastMessageAt || 0).getTime();
          return bTime - aTime;
        });

        console.log("Visible chats after filtering and sorting:", visible.map(c => c.roomId));

        const deduped = normalizeAndDeduplicateChats(visible, currentUser.id);
        setChats(deduped);
      });

  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5001", { withCredentials: true });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit("register-user", currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!selectedRoomId || !socketRef.current) return;
    socketRef.current.emit("join-room", selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    const handler = (message: Message) => setMessages((prev) => [...prev, message]);
    if (socketRef.current) {
      socketRef.current.on("receive-message", handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive-message", handler);
      }
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser, lastCreatedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return;
    fetch(`http://localhost:5001/api/messages/${selectedRoomId}`)
      .then((res) => res.json())
      .then(setMessages);
  }, [selectedRoomId]);

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content" style={{ display: "flex", padding: 0 }}>
        <ChatSidebar
          userId={currentUser?.id}
          chats={chats}
          onSelectChat={(chat) => {
            setSelectedRoomId(chat.roomId);
            setIsNewChat(false);
          }}
          onNewGroup={() => setShowGroupModal(true)}
          onNewDirectMessage={() => {
            setShowDMModal(true);
            setSelectedRoomId(null);
          }}
        />

        <div className="chat-main">
          {selectedChat && (
            <div className="chat-header">
              {selectedChat.isGroup
                ? selectedChat.groupName || "Group Chat"
                : selectedChat.user?.username || "Direct Message"}
            </div>
          )}

          {selectedRoomId ? (
            <>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`post ${msg.sender_id === currentUser?.id ? "sent" : "received"}`}
                  >
                    <div>{msg.content}</div>
                    <span className="timestamp">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <MessageInput socket={socketRef.current} senderId={currentUser.id} roomId={selectedRoomId} />
            </>
          ) : (
            <div className="empty-chat-msg">Select a chat to start messaging!</div>
          )}
        </div>

      </main>

      {showGroupModal && currentUser && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          currentUserId={currentUser.id}
          onGroupCreated={(roomId) => {
            console.log("Created new group:", roomId);
            setSelectedRoomId(roomId);
            setLastCreatedRoomId(roomId);
            setShowGroupModal(false);
            // loadChats will be triggered automatically by useEffect on lastCreatedRoomId
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
            loadChats();
          }}
        />
      )}
    </div>
  );
};

export default Messages;
