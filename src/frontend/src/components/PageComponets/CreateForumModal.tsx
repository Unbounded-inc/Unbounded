import React, { useState } from "react";
import "../../Styles/CreateForumModal.css";
import { useUser } from "../../lib/UserContext";

interface CreateForumModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  addForum: (forum: any) => void;
}

const CreateForumModal: React.FC<CreateForumModalProps> = ({
                                                             showModal,
                                                             setShowModal,
                                                             addForum,
                                                           }) => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showModal || !user) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 3) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5001/api/forums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: body,
          tags,
          created_by: user.id,
          is_anonymous: user.is_anonymous,
        }),
      });

      if (!res.ok) throw new Error("Failed to create forum");

      const newForum = await res.json();

      addForum({
        ...newForum,
        created_by_user: {
          username: user.username,
          profile_picture: user.profile_picture,
        },
      });

      setTitle("");
      setBody("");
      setTags([]);
      setTagInput("");
      setShowModal(false);
    } catch (err) {
      console.error("Error creating forum:", err);
    } finally {
      setIsSubmitting(false);
    }
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
            <button
              type="button"
              className="forum-create-add-tag-btn"
              onClick={handleAddTag}
            >
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

          {user.is_anonymous && (
            <p
              style={{
                fontStyle: "italic",
                color: "#777",
                marginTop: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              You are posting anonymously
            </p>
          )}

          <div className="forum-create-buttons">
            <button
              className="forum-create-cancel-btn"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="forum-create-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForumModal;
