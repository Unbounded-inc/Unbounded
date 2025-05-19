import { JSX, useState } from "react";
import { useUser, type User } from "../../../lib/UserContext";
import NewChatComponent from "../../../components/PageComponets/NewChatComponent";
import Chat from "./chat";
import CreateGroupModal from "../../../components/PageComponets/CreateGroupModal";
import "../../../Styles/Messages.css";

interface ChatPreview {
  roomId: string;
  isGroup: boolean;
  groupName?: string;
  users?: User[];
  user?: User;
}

function MessagesPage(): JSX.Element {
  const { user } = useUser();
  const [activeChat, setActiveChat] = useState<ChatPreview | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);

  return (
    <main className="feed-content" style={{ display: "flex", padding: 0 }}>
      <NewChatComponent
        currentUserId={(user?.id || "").toString()}
        onSelectUser={(selectedUser: User) => {
          setActiveChat({
            roomId: selectedUser.id.toString(),
            isGroup: false,
            user: selectedUser,
          });
        }}
        onCreateGroup={() => setShowCreateGroup(true)}
      />

      {activeChat && user ? (
        <Chat
          currentUser={user}
          receiverId={activeChat.user?.id?.toString() || activeChat.roomId}
        />
      ) : (
        <div className="chat-main empty-chat-msg">Select a chat to start messaging!</div>
      )}

      {showCreateGroup && user && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(roomId: string) => {
            setShowCreateGroup(false);
            setActiveChat({ roomId, isGroup: true });
          }}
          currentUserId={user.id.toString()}
        />
      )}
    </main>
  );
}

export default MessagesPage;
