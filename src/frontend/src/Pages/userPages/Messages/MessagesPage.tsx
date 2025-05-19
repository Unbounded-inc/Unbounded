import ChatSidebar from "../../../components/PageComponets/ChatSidebar";
import Chat from "./chat";
import { useUser } from "../../../lib/UserContext";
import { useEffect, useState } from "react";
import CreateGroupModal from "../../../components/PageComponets/CreateGroupModal";
import NewChatComponent from "../../../components/PageComponets/NewChatComponent";

function MessagesPage() {
  const { user } = useUser();

  const [activeChat, setActiveChat] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [chatList, setChatList] = useState([]); // ✅ centralized chat state

  useEffect(() => {
    async function fetchChats() {
      if (!user) return;
      const res = await fetch(`http://localhost:5001/api/chat-rooms/${user.id}`);
      const data = await res.json();

      // Deduplicate if necessary
      const seen = new Set();
      const deduped = data.filter((chat) => {
        if (seen.has(chat.roomId)) return false;
        seen.add(chat.roomId);
        return true;
      });

      setChatList(deduped);
    }

    fetchChats();
  }, [user]);

  if (!user) return <div>Loading...</div>;

  return (
    <main className="feed-content" style={{ display: "flex", padding: 0 }}>
      <ChatSidebar
        userId={user.id}
        chats={chatList}
        onSelectChat={setActiveChat}
        onNewGroup={() => setShowCreateGroup(true)}
        onNewDirectMessage={() => {
          setIsNewChat(true);
          setActiveChat(null);
        }}
      />

      {isNewChat ? (
        <NewChatComponent
          currentUserId={user.id}
          onSelectUser={(selectedUser) => {
            setIsNewChat(false);
            setActiveChat({ user: selectedUser, isGroup: false });
          }}
        />
      ) : activeChat ? (
        <Chat currentUser={user} activeChat={activeChat} />
      ) : (
        <div className="chat-main empty-chat-msg">Select a chat to start messaging!</div>
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(roomId) => {
            setShowCreateGroup(false);
            setActiveChat({ roomId, isGroup: true });
          }}
          currentUserId={user.id}
        />
      )}
    </main>
  );
}

export default MessagesPage;
