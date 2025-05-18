import React, { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
}

interface Props {
  currentUserId: string;
  onClose: () => void;
  onChatStarted: (roomId: string) => void;
}

const CreateDMModal: React.FC<Props> = ({ currentUserId, onClose, onChatStarted }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);


  useEffect(() => {
  if (usernameInput.length === 0) {
    setSuggestions([]);
    return;
  }

  fetch("http://localhost:5001/api/users")
    .then((res) => res.json())
    .then((users) => {
      const filtered = users.filter(
        (u: User) =>
          u.id !== currentUserId &&
          u.username.toLowerCase().includes(usernameInput.toLowerCase())
      );
      setSuggestions(filtered);
    });
}, [usernameInput, currentUserId]);


  const handleSelectUser = async (user: User) => {
    const res = await fetch("http://localhost:5001/api/chat-rooms/one-on-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAId: currentUserId,
        userBId: user.id,
      }),
    });

    const data = await res.json();
    if (data.roomId) {
      onChatStarted(data.roomId);
    } else {
      alert("Failed to start chat");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h2>Start New Chat</h2>
        

        {suggestions.length > 0 && (
          <ul className="user-suggestions">
            {suggestions.map((user) => (
              <li key={user.id} onClick={() => handleSelectUser(user)} className="suggestion-item">
                {user.username}
              </li>
            ))}
          </ul>
        )}
        <div className="search-dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />

          {suggestions.length > 0 && (
            <ul className="user-suggestions">
              {suggestions.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="suggestion-item"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateDMModal;
