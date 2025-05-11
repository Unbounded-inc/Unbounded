import { useState, useEffect } from "react";

function NewChatComponent({ currentUserId, onSelectUser }) {
  const [users, setUsers] = useState([]);

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
      <ul>
        {users
          .filter((user) => user.id !== currentUserId)
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
