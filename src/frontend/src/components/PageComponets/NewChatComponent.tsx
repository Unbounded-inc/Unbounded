import { useState, useEffect } from "react";
import { User } from "../../lib/UserContext";

interface NewChatComponentProps {
  currentUserId: string;
  onSelectUser: (user: User) => void;
  onCreateGroup: () => void;
}

function NewChatComponent({ currentUserId, onSelectUser, onCreateGroup }: NewChatComponentProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        credentials: "include",
      });
      const data = await response.json();
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <div className="chat-main">
      <h2>Start a New Chat</h2>
      <button onClick={onCreateGroup}>+ New Group Chat</button>
      <ul>
        {users
          .filter((user) => user.id.toString() !== currentUserId)
          .map((user) => (
            <li key={user.id} onClick={() => onSelectUser(user)}>
              {user.username}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default NewChatComponent;
