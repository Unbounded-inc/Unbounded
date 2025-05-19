import React, { useEffect, useState, useRef } from "react";
import "../../Styles/Feed.css";
import "../../Styles/Messages.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import MessageInput from "../../components/PageComponets/MessageInput";
import CreateGroupModal from "../../components/PageComponets/CreateGroupModal";
import CreateDMModal from "../../components/PageComponets/CreateDMModal";
import { useUser } from "../../lib/UserContext";
import io, { Socket } from "socket.io-client";
import ChatSidebar from "../../components/PageComponets/ChatSidebar";
import { ChatPreview } from "../../lib/types";


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
    const userIds = chat.users?.map((u) => u.id.toString()).sort().join(",") || "";
    const dedupeKey = `${chat.roomId}:${userIds}`;

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      uniqueChats.push({
        ...chat,
        users: chat.isGroup ? chat.users : undefined,
        user: !chat.isGroup
          ? chat.user || chat.users?.find((u) => u.id.toString() !== currentUserId)
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadChats = () => {
    if (!currentUser) return;

    fetch(`http://localhost:5001/api/chat-rooms/${currentUser.id}`)
      .then((res) => res.json())
      .then((data: ChatPreview[]) => {
        const visible = data.filter((chat: ChatPreview) => {
          return (
            !chat.isGroup ||
            Number(chat.message_count) > 0 ||
            chat.roomId === lastCreatedRoomId
          );
        });

        visible.sort((a: ChatPreview, b: ChatPreview) => {
          const aTime = new Date(a.lastMessageAt || 0).getTime();
          const bTime = new Date(b.lastMessageAt || 0).getTime();
          return bTime - aTime;
        });

        const deduped = normalizeAndDeduplicateChats(visible, currentUser.id.toString());
        setChats(deduped);
      });
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5001", { withCredentials: true });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit("register-user", currentUser.id.toString());
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedRoomId && socketRef.current) {
      socketRef.current.emit("join-room", selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    const handler = (message: Message) => setMessages((prev) => [...prev, message]);
    socketRef.current?.on("receive-message", handler);
    return () => {
      socketRef.current?.off("receive-message", handler);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      .then((data: Message[]) => setMessages(data));
  }, [selectedRoomId]);

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content" style={{ display: "flex", padding: 0 }}>
        <ChatSidebar
          userId={currentUser?.id.toString() || ""}
          chats={chats}
          onSelectChat={(chat: ChatPreview) => {
            setSelectedRoomId(chat.roomId);
          }}
          onNewGroup={() => setShowGroupModal(true)}
          onNewDirectMessage={() => {
            setShowDMModal(true);
            setSelectedRoomId(null);
          }}
        />

        <div className="chat-main">
          {selectedRoomId && currentUser ? (
            <>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`post ${
                      msg.sender_id.toString() === currentUser.id.toString() ? "sent" : "received"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <span className="timestamp">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <MessageInput
                socket={socketRef.current}
                senderId={currentUser.id.toString()}
                roomId={selectedRoomId}
              />
            </>
          ) : (
            <div className="empty-chat-msg">Select a chat to start messaging!</div>
          )}

        </div>
      </main>

      {showGroupModal && currentUser && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          currentUserId={currentUser.id.toString()}
          onGroupCreated={(roomId: string) => {
            setSelectedRoomId(roomId);
            setLastCreatedRoomId(roomId);
            setShowGroupModal(false);
          }}
        />
      )}

      {showDMModal && currentUser && (
        <CreateDMModal
          currentUserId={currentUser.id.toString()}
          onClose={() => setShowDMModal(false)}
          onChatStarted={(roomId: string) => {
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
