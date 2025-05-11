import { useState } from "react";

function CreateGroupModal({ onClose, onGroupCreated, currentUserId }) {
  const [groupName, setGroupName] = useState("");
  const [membersInput, setMembersInput] = useState("");

  async function handleCreate(e) {
    e.preventDefault();

    const memberIds = membersInput.split(",").map(id => id.trim()).filter(Boolean);
    if (!memberIds.includes(currentUserId)) {
      memberIds.push(currentUserId);
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat-rooms/group`, {
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

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            required
          />

          <textarea
            value={membersInput}
            onChange={(e) => setMembersInput(e.target.value)}
            placeholder="Comma-separated user IDs (e.g. id1,id2,id3)"
          />

          <div className="modal-actions">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              Create
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;
