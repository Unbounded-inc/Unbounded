import { useState } from "react";

function CreateGroupChat({ onGroupCreated }: { onGroupCreated: (roomId: string) => void }) {
  const [groupName, setGroupName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]); 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newRoomId = await createGroupChat(groupName, memberIds);
    onGroupCreated(newRoomId);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Comma-separated member IDs"
        onChange={(e) => setMemberIds(e.target.value.split(",").map(x => x.trim()))}
      />
      <button type="submit" className="start-chat-btn">Create Group Chat</button>
    </form>
  );
}

export default CreateGroupChat;
