import React, { useEffect, useState } from "react";
import "../../Styles/messages/Messages.css";

interface User {
  id: string;
  username: string;
}

interface Props {
  onClose: () => void;
  onGroupCreated: (roomId: string) => void;
  currentUserId: string;
}

const CreateGroupModal: React.FC<Props> = ({
  onClose,
  onGroupCreated,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (usernameInput.length === 0) {
      setUserSuggestions([]);
      return;
    }

    fetch("http://localhost:5001/api/users")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (user: User) =>
            user.id !== currentUserId &&
            user.username.toLowerCase().includes(usernameInput.toLowerCase()) &&
            !selectedUsers.some((sel) => sel.id === user.id)
        );
        setUserSuggestions(filtered);
      })
      .catch((err) => console.error("Error loading users:", err));
  }, [usernameInput, selectedUsers, currentUserId]);

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setUsernameInput("");
    setUserSuggestions([]);
  };

  const handleCreate = async () => {
    if (!groupName || selectedUsers.length === 0) return;

    const res = await fetch("http://localhost:5001/api/chat-rooms/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        memberIds: [currentUserId, ...selectedUsers.map((u) => u.id)],
      }),
    });

    const data = await res.json();
    if (data.roomId) {
      onGroupCreated(data.roomId);
    } else {
      alert("Failed to create group chat.");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h2>Create Group Chat</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <div className="search-dropdown-wrapper">
            <input
              type="text"
              placeholder="Add users by username"
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

          {selectedUsers.length > 0 && (
            <div className="selected-users">
              {selectedUsers.map((user) => (
                <span key={user.id} className="user-chip">
                  {user.username}
                  <button
                    onClick={() =>
                      setSelectedUsers((prev) =>
                        prev.filter((u) => u.id !== user.id)
                      )
                    }
                    className="remove-user"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
