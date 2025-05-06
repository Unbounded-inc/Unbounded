import React, { useState } from "react";
import "../../Styles/CreateForumModal.css";

interface CreateForumModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  addForum: (forum: {
    id: number;
    title: string;
    body: string;
    tags: string[];
    author: string;
    date: string;
  }) => void;
}


const CreateForumModal: React.FC<CreateForumModalProps> = ({ showModal, setShowModal, addForum }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  if (!showModal) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 3) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;

    const newForum = {
      id: Date.now(), // temporary unique ID
      title,
      body,
      tags,
      author: "manny", // TODO: replace with actual user later
      date: new Date().toLocaleDateString()
    };

    addForum(newForum);
    setTitle("");
    setBody("");
    setTags([]);
    setTagInput("");
    setShowModal(false);
  };


  return (
    <div className="forum-create-overlay">
      <div className="forum-create-container">
        <h2 className="forum-create-title">Create Forum</h2>
        <div className="forum-create-form">
          <input
            type="text"
            placeholder="Forum Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="forum-create-input"
          />

          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="forum-create-textarea"
          />

          <div className="forum-create-tag-row">
            <input
              type="text"
              placeholder="Add up to 3 different tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="forum-create-input"
              style={{ flex: 1 }}
            />
            <button type="button" className="forum-create-add-tag-btn" onClick={handleAddTag}>
              Add
            </button>
          </div>

          <div className="forum-create-tag-list">
            {tags.map((tag, index) => (
              <div key={index} className="forum-create-tag">
                {tag}
                <button onClick={() => handleRemoveTag(index)}>✕</button>
              </div>
            ))}
          </div>

          <div className="forum-create-buttons">
            <button className="forum-create-cancel-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="forum-create-submit-btn" onClick={handleSubmit}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForumModal;
