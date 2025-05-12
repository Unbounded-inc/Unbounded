import { useEffect, useState } from "react";

function CreateGroupModal({ onClose, onGroupCreated, currentUserId }) {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userList, setUserList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Unexpected users API response:", data);
          return;
        }
        setUserList(data.filter((u) => u.id !== currentUserId));
      });
  }, [currentUserId]);

  const filteredUsers = userList.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (id) => {
    console.log("Selected IDs:", selectedIds);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function handleCreate(e) {
    e.preventDefault();

    const memberIds = [...selectedIds];
    if (!memberIds.includes(currentUserId)) {
      memberIds.push(currentUserId);
    }

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/chat-rooms/group`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: groupName, memberIds }),
    });

    const data = await response.json();
    onGroupCreated(data.roomId);
  }

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Create Group Chat</h2>

        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            required
          />

          {selectedIds.length > 0 && (
            <div className="selected-users">
              {userList
                .filter((u) => selectedIds.includes(u.id))
                .map((u) => (
                  <span
                    key={u.id}
                    className="selected-user-pill"
                    onClick={() => toggleUser(u.id)}
                    title="Click to remove"
                  >
                    {u.username} ✕
                  </span>
                ))}
            </div>
          )}


          <div className="search-dropdown-wrapper">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && filteredUsers.length > 0 && (
              <ul className="user-suggestions">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={selectedIds.includes(user.id) ? "selected" : ""}
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            )}

          </div>

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
}

export default CreateGroupModal;

