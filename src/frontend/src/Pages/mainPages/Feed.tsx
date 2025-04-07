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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/posts");
        const data = await res.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

  const handleUpload = async () => {
    console.log("Upload triggered");

    if (!postText.trim() || !user) return;

    try {
      const response = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          content: postText,
          image_url: null,
          is_anonymous: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const res = await fetch("http://localhost:5001/api/posts");
        const refreshed = await res.json();
        setPosts(refreshed.posts);
        setPostText("");
      } else {
        console.error("Post creation failed:", data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
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
            <div className="button-row">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={icon}
                  alt="icon"
                  style={{ width: "40px", height: "40px" }}
                />
                <input
                  id="file-upload"
                  type="file"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
                <button
                  type="button"
                  className="new-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Photo
                </button>
              </div>
              {/* 🔧 Replace PostUpload with direct button */}
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
              <img
                src={post.profile_picture || placeholder}
                alt="Profile"
                className="profile-pic"
              />
              <div className="post-user">
                <strong>{post.username}</strong>
                <p>@{post.username}</p>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {post.images?.length > 0 && (
              <div className="post-images">
                {post.images.map((img: string, i: number) => (
                  <img src={img} key={i} alt="Post" className="post-img" />
                ))}
              </div>
            )}
            <div className="post-actions">
              <button>
                <img src={heart} alt="like icon" className="action-icon" /> Like
              </button>
              <button>
                <img src={comment} alt="comment icon" className="action-icon" /> Comment
              </button>
              <button>
                <img src={share} alt="share icon" className="action-icon" /> Share
              </button>
            </div>
          </div>
        ))}
      </main>

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