import React, { useState } from "react";
import "../../Styles/ForumsPage.css";
import placeholder from "../../assets/placeholder.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";
import Sidebar from "../../components/PageComponets/Sidebar";
import CreateForumModal from "../../components/PageComponets/CreateForumModal";

const Forums: React.FC = () => {
  const [forums, setForums] = useState([
    {
      id: 1,
      title: "All Lowercase Example",
      date: "9/10/2011",
      body: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah...",
      tags: ["Example"],
      author: "isabel"
    },
    {
      id: 2,
      title: "ALL UPPERCASE EXAMPLE",
      date: "10/10/2011",
      body: "BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH...",
      tags: ["Test"],
      author: "calvin"
    },
    {
      id: 3,
      title: "MiXeD CaSe Example",
      date: "11/10/2011",
      body: "BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh BlAh...",
      tags: ["Tag"],
      author: "manny"
    },
    {
      id: 4,
      title: "Unique Content Example",
      date: "12/10/2011",
      body: "This forum post contains entirely different content than just blahs. It discusses real things for once, hooray!",
      tags: ["Discussion"],
      author: "arsen"
    }
  ]);

  const [selectedForum, setSelectedForum] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { forumId: 1, content: "This is a great discussion!" },
    { forumId: 2, content: "I totally agree with this point." },
    { forumId: 3, content: "Interesting take!" },
    { forumId: 4, content: "Thanks for sharing your thoughts." }
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedForum) return;
    setComments([...comments, { forumId: selectedForum.id, content: commentText }]);
    setCommentText("");
  };

  const handleAddForum = (newForum: any) => {
    setForums((prev) => [...prev, newForum]);
  };

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content">
        <h2 className="friends-title">Community Forums</h2>

        <div className="friends-search-bar">
          <input
            type="text"
            placeholder="Search forum threads..."
            className="friends-search-input"
          />
          <button className="add-friend-btn" onClick={() => setShowCreateModal(true)}>Create</button>
        </div>

        <div className="forums-grid">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="post1"
              onClick={() => setSelectedForum(forum)}
            >
              <div className="post-header">
                <img src={placeholder} alt="pfp" className="profile-pic" />
                <div className="post-user">
                  <strong>{forum.title}</strong>
                  <p>Published on {forum.date}</p>
                </div>
              </div>

              <p className="post-content">{forum.body}</p>

              <div className="post-actions">
                <button><img src={heart} alt="like icon" className="action-icon" /></button>
                <button><img src={comment} alt="comment icon" className="action-icon" /></button>
                <button><img src={share} alt="share icon" className="action-icon" /></button>
              </div>

              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {forum.tags.map((tag, index) => (
                  <button key={index} className="tag-button">{tag}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedForum && (
        <div className="modal-overlay">
          <div className="forum-modal-content">
            <h2 style={{ fontSize: "1.85rem", color: "#2d2d2d", marginBottom: "0.25rem" }}>
              {selectedForum.title}
            </h2>
            <p className="forum-author">Posted by @{selectedForum.author} on {selectedForum.date}</p>

            <div className="forum-body" style={{ marginBottom: "1.5rem" }}>
              {selectedForum.body}
            </div>

            <div className="comment-box">
              <img src={placeholder} alt="pfp" className="profile-pic" />
              <textarea
                className="modal-textarea"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>

            <div className="modal-buttons">
              <button className="modal-button-cancel" onClick={() => setSelectedForum(null)}>Close</button>
              <button className="modal-button-save" onClick={handleAddComment}>Comment</button>
            </div>

            <div style={{ marginTop: "2rem" }}>
              {comments.filter(c => c.forumId === selectedForum.id).map((c, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  backgroundColor: "#f6f7fa",
                  padding: "1rem",
                  borderRadius: "10px",
                  marginBottom: "1rem"
                }}>
                  <img src={placeholder} alt="comment user" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: "#333" }}>@user</p>
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

      <aside className="feed-right-panel">
        <div className="notification-panel">
          <h3>Notifications</h3>
          <p className="notification-item">Manny liked your post.</p>
          <p className="notification-item">Isabel commented on your post.</p>
          <p className="notification-item">New message from Calvin.</p>
        </div>
      </aside>
    </div>
  );
};

export default Forums;
