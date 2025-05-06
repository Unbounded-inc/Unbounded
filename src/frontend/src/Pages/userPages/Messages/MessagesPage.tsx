import ChatSidebar from "../../../components/PageComponets/ChatSidebar";
import Chat from "./chat";
import { useUser } from "../../../lib/UserContext";
import { useEffect, useState } from "react";
import CreateGroupModal from "../../../components/PageComponets/CreateGroupModal";
import NewChatComponent from "../../../components/PageComponets/NewChatComponent";


function MessagesPage() {
  const { user } = useUser();

  const [activeChat, setActiveChat] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false); // ✅ track if starting a new DM
  const [showCreateGroup, setShowCreateGroup] = useState(false); // ✅ track if showing group creation modal

  useEffect(() => {
    if (!user) {
      console.error("User not loaded yet.");
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="feed-content" style={{ display: "flex", padding: 0 }}>
      <ChatSidebar
        userId={user.id}
        onSelectChat={setActiveChat}
        onNewGroup={() => setShowCreateGroup(true)} // ✅ open group modal
        onNewDirectMessage={() => {
          setIsNewChat(true);
          setActiveChat(null); // ✅ clear active chat
        }}
      />

      {/* 🛠 Main chat display */}
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



      {/* 🛠 Group creation modal */}
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
