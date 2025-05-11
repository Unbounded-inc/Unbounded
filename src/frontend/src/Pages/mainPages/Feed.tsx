import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../lib/UserContext";
import "../../Styles/Feed.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";
import icon from "../../assets/icon.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";
import PostTextBox from "../../components/PageComponets/PostTextBox";

const Feed: React.FC = () => {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/posts");
        const data = await res.json();
        setPosts(data.posts.map((post: any) => ({
          ...post,
          likedByCurrentUser: post.liked_by_ids?.includes(user?.id),
          likeCount: Number(post.like_count) || 0
        })));
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };

    fetchPosts();
  }, [user]);

  const fetchComments = async (postId: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/comments/${postId}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleOpenPost = async (post: any) => {
    setSelectedPost(post);
    await fetchComments(post.id);
  };

  const submitComment = async () => {
    if (!user || !commentText.trim() || !selectedPost) return;

    const payload = {
      post_id: selectedPost.id,
      user_id: user.id,
      content: commentText,
    };

    try {
      await fetch("http://localhost:5001/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetchComments(selectedPost.id);
      setCommentText("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const maxSizeMB = 2;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        alert(`File is too large. Max size is ${maxSizeMB}MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!postText.trim() || !user) return;

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("content", postText);
    formData.append("is_anonymous", "false");
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const res = await fetch("http://localhost:5001/api/posts");
        const refreshed = await res.json();
        setPosts(refreshed.posts.map((post: any) => ({
          ...post,
          likedByCurrentUser: post.liked_by_ids?.includes(user?.id),
          likeCount: Number(post.like_count) || 0
        })));
        setPostText("");
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        console.error("Post creation failed:", data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5001/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                ...post,
                likedByCurrentUser: !post.likedByCurrentUser,
                likeCount: post.likedByCurrentUser
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content">
        <div className="feed-header">
          <h2>Home Feed</h2>
          <div className="feed-nav-options">
            <select className="nav-dropdown">
              <option disabled selected hidden>
                Communities
              </option>
              <option>Carti Fan</option>
              <option>One Piece Fan</option>
              <option>Lol</option>
            </select>
            <button className="hover-btn">Friends</button>
            <button className="hover-btn">All</button>
          </div>
        </div>

        {/* New Post Input Box */}
        <div className="new-post">
          <img
            src={user?.profile_picture || placeholder}
            alt="Profile"
            className="profile-pic"
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <PostTextBox postText={postText} onChange={handleInputChange} />
            {previewUrl && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={previewUrl} alt="Preview" className="preview-img" />
                <button onClick={handleRemoveImage} className="remove-image-btn" aria-label="Remove image">
                  ×
                </button>
              </div>
            )}
            <div className="button-row">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={icon} alt="icon" style={{ width: "40px", height: "40px" }} />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button type="button" className="new-btn" onClick={() => fileInputRef.current?.click()}>
                  Photo
                </button>
              </div>
              <button className="upload-btn" onClick={handleUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <img src={post.profile_picture || placeholder} alt="Profile" className="profile-pic" />
              <div className="post-user">
                <strong>{post.username}</strong>
                <p>@{post.username}</p>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {post.image_url && (
              <div className="post-images">
                <img src={`http://localhost:5001${post.image_url}`} alt="Post" className="post-img" />
              </div>
            )}
            <div className="post-actions">
              <button onClick={() => toggleLike(post.id)}>
                <img src={heart} alt="like icon" className={`action-icon ${post.likedByCurrentUser ? "liked" : ""}`} />
                {post.likeCount} Like{post.likeCount !== 1 ? "s" : ""}
              </button>
              <button onClick={() => handleOpenPost(post)}>
                <img src={comment} alt="comment icon" className="action-icon" /> Comment
              </button>
              <button>
                <img src={share} alt="share icon" className="action-icon" /> Share
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Comment Modal */}
      {selectedPost && (
        <div className="tweet-modal-overlay">
          <div className="tweet-modal-content">
            <h2>{selectedPost.content}</h2>
            <p className="tweet-modal-text">@{selectedPost.username}</p>
            {selectedPost.image_url && (
              <img
                src={`http://localhost:5001${selectedPost.image_url}`}
                alt="Tweet"
                style={{ width: "100%", borderRadius: "12px", marginTop: "1rem" }}
              />
            )}
            <div className="tweet-modal-comment-box">
              <img src={user?.profile_picture || placeholder} alt="profile" className="profile-pic" />
              <textarea
                className="tweet-modal-textarea"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <div className="tweet-modal-buttons">
              <button className="tweet-modal-button-cancel" onClick={() => setSelectedPost(null)}>
                Close
              </button>
              <button
                className="tweet-modal-button-post"
                onClick={submitComment}
                disabled={!commentText.trim()}
              >
                Comment
              </button>
            </div>

            {comments.length === 0 ? (
              <p style={{ marginTop: "1rem", color: "#777" }}>No comments yet.</p>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="comment" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "1rem" }}>
                  <img
                    src={cmt.profile_picture || placeholder}
                    alt="pfp"
                    className="profile-pic"
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                  />
                  <div style={{ background: "#f5f5f5", padding: "8px 12px", borderRadius: "12px", maxWidth: "90%" }}>
                    <strong>{cmt.username}</strong>
                    <p>{cmt.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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

export default Feed;
