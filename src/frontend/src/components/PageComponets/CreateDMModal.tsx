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
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);

  useEffect(() => {
    if (usernameInput.length === 0) {
      setUserSuggestions([]);
      return;
    }

    fetch("http://localhost:5001/api/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched users:", data); 
        const filtered = data.filter(
          (user: User) =>
            user.id !== currentUserId &&
            user.username.toLowerCase().includes(usernameInput.toLowerCase())
        );
        console.log("Filtered suggestions:", filtered); 
        setUserSuggestions(filtered);
      })
      .catch((err) => console.error("Error loading users:", err));
  }, [usernameInput, currentUserId]);


  const handleUserSelect = async (user: User) => {
    try {
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
        alert("Failed to create chat.");
      }
    } catch (err) {
      console.error("Failed to start DM:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h2>Start a New Chat</h2>

        <div className="search-dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter a username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />

          {userSuggestions.length > 0 && (
            <ul className="user-suggestions">
              {userSuggestions.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
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
