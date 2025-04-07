import React, { useState, useRef } from "react";
import { useUser } from "../../lib/UserContext";
import "../../Styles/Feed.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";
import icon from "../../assets/icon.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";
import PostTextBox from "../../components/PageComponets/PostTextBox";
import PostUpload from "../../components/PageComponets/PostUploadButton";

const Feed: React.FC = () => {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

  const handleUpload = () => {
    if (!postText.trim() || !user) return;

    const newPost = {
      id: Date.now(),
      username: `${user.first_name} ${user.last_name}`,
      handle: `@${user.username}`,
      profile_picture: user.profile_picture,
      content: postText,
      images: [],
    };

    setPosts([newPost, ...posts]);
    setPostText("");
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
              <PostUpload onClick={handleUpload} />
            </div>
          </div>
        </div>

        {/* Dynamic Posts */}
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
                <p>{post.handle}</p>
              </div>
            </div>
            <p className="post-content">{post.content}</p>

            {post.images.length > 0 && (
              <div className="post-images">
                {post.images.map((img: string, i: number) => (
                  <img src={img} key={i} alt="Post" className="post-img" />
                ))}
              </div>
            )}

            <div className="post-actions">
              <button>
                <img src={heart} alt="like icon" className="action-icon" />
                Like
              </button>
              <button>
                <img src={comment} alt="comment icon" className="action-icon" />
                Comment
              </button>
              <button>
                <img src={share} alt="share icon" className="action-icon" />
                Share
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