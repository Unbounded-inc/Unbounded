import React, { useState, useEffect } from "react";
import "../../Styles/ForumsPage.css";
import placeholder from "../../assets/placeholder.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";
import Sidebar from "../../components/PageComponets/Sidebar";
import CreateForumModal from "../../components/PageComponets/CreateForumModal";
import { useUser } from "../../lib/UserContext";
import NotificationSidebar from "../../components/PageComponets/NotificationSidebar.tsx";

const Forums: React.FC = () => {
  const { user } = useUser();
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/forums");
        const data = await res.json();
        setForums(data);
      } catch (err) {
        console.error("Failed to fetch forums:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  const handleOpenForum = async (forum: any) => {
    setSelectedForum(forum);
    setCommentText("");
    try {
      const res = await fetch(`http://localhost:5001/api/forums/${forum.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedForum || !user) return;

    try {
      const res = await fetch(`http://localhost:5001/api/forums/${selectedForum.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: commentText,
          is_anonymous: user.is_anonymous,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const newComment = await res.json();

      setComments((prev) => [
        ...prev,
        {
          ...newComment,
          user: {
            username: user.username,
            profile_picture: user.profile_picture,
          },
          is_anonymous: user.is_anonymous,
          anonymous_alias: newComment.anonymous_alias,
        },
      ]);

      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleAddForum = (newForum: any) => {
    setForums((prev) => [newForum, ...prev]);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="feed-container">
      <Sidebar />
      <NotificationSidebar />

      <main className="feed-content">
        <h2 className="friends-title">Community Forums</h2>

        <div className="friends-search-bar">
          <input type="text" placeholder="Search forum threads..." className="friends-search-input" />
          <button className="add-friend-btn" onClick={() => setShowCreateModal(true)}>
            Create
          </button>
        </div>

        {loading ? (
          <p>Loading forums...</p>
        ) : (
          <div className="forums-grid">
            {forums.map((forum) => (
              <div key={forum.id} className="post1" onClick={() => handleOpenForum(forum)}>
                <div className="post-header">
                  <img
                    src={forum.is_anonymous ? placeholder : forum.created_by_user?.profile_picture || placeholder}
                    alt="pfp"
                    className="profile-pic"
                  />
                  <div className="post-user">
                    <strong>{forum.title}</strong>
                    <p>
                      Posted by{" "}
                      {forum.is_anonymous
                        ? forum.anonymous_alias
                        : `@${forum.created_by_user?.username || "user"}`}{" "}
                      on {formatDate(forum.created_at)}
                    </p>
                  </div>
                </div>

                <p className="post-content">{forum.description}</p>

                <div className="post-actions">
                  <button><img src={heart} alt="like icon" className="action-icon" /></button>
                  <button><img src={comment} alt="comment icon" className="action-icon" /></button>
                  <button><img src={share} alt="share icon" className="action-icon" /></button>
                </div>

                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {forum.tags.map((tag: string, index: number) => (
                    <button key={index} className="tag-button">{tag}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedForum && (
        <div className="modal-overlay">
          <div className="forum-modal-content">
            <h2 style={{ fontSize: "1.85rem", color: "#2d2d2d", marginBottom: "0.25rem" }}>
              {selectedForum.title}
            </h2>
            <p className="forum-author">
              Posted by{" "}
              {selectedForum.is_anonymous
                ? selectedForum.anonymous_alias
                : `@${selectedForum.created_by_user?.username || "user"}`}{" "}
              on {formatDate(selectedForum.created_at)}
            </p>

            <div className="forum-body" style={{ marginBottom: "1.5rem" }}>
              {selectedForum.description}
            </div>

            <div className="comment-box">
              <img src={user?.profile_picture || placeholder} alt="pfp" className="profile-pic" />
              <textarea
                className="modal-textarea"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>

            {user?.is_anonymous && (
              <p style={{ fontStyle: "italic", color: "#777", marginBottom: "1rem" }}>
                You are commenting anonymously
              </p>
            )}

            <div className="modal-buttons">
              <button className="modal-button-cancel" onClick={() => setSelectedForum(null)}>Close</button>
              <button className="modal-button-save" onClick={handleAddComment} disabled={!user}>
                Comment
              </button>
            </div>

            <div style={{ marginTop: "2rem" }}>
              {[...comments].reverse().map((c, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  backgroundColor: "#f6f7fa",
                  padding: "1rem",
                  borderRadius: "10px",
                  marginBottom: "1rem"
                }}>
                  <img
                    src={c.is_anonymous ? placeholder : c.user?.profile_picture || placeholder}
                    alt="comment user"
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: "#333" }}>
                      {c.is_anonymous ? c.anonymous_alias : `@${c.user?.username || "user"}`}
                    </p>
                    <p style={{ margin: 0, color: "#444", fontSize: "0.95rem" }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateForumModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        addForum={handleAddForum}
      />
    </div>
  );
};

export default Forums;
