import React, { useState, useRef } from "react";
import "../../Styles/Feed.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";
import empty from "../../assets/empty.jpg";
import icon from "../../assets/icon.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";

const Feed: React.FC = () => {
  const [postText, setPostText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
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

        <div className="new-post">
          <img src={placeholder} alt="Profile" className="profile-pic" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span
              style={{
                alignSelf: "flex-end",
                fontSize: "0.85rem",
                margin: "0px",
                color: "#555",
              }}
            >
              {280 - postText.length} characters left
            </span>
            <textarea
              placeholder="Share something..."
              className="share-input"
              maxLength={280}
              value={postText}
              onChange={handleInputChange}
            />

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
              <button className="upload-btn">Upload</button>
            </div>
          </div>
        </div>

       
        <div className="post">
          <div className="post-header">
            <img src={placeholder} alt="Profile" className="profile-pic" />
            <div className="post-user">
              <strong>Esperanza Rising</strong>
              <p>@thatonepersonfromthebook</p>
            </div>
          </div>
          <p className="post-content">
            blah blah blah blah blah blah blah blah blah blah blah blah blah
            blah blah blah blah!
          </p>
          <div className="post-images">
            <img src={empty} alt="Post" className="post-img" />
            <img src={empty} alt="Post" className="post-img" />
            <img src={empty} alt="Post" className="post-img" />
          </div>
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

        {/* Post 2 */}
        <div className="post">
          <div className="post-header">
            <img src={placeholder} alt="Profile" className="profile-pic" />
            <div className="post-user">
              <strong>Romeo Santos</strong>
              <p>@guyfromaventura</p>
            </div>
          </div>
          <p className="post-content">
            blah blah blah blah blah blah blah blah blah blah blah blah blah
            blah blah blah blah blah blah.
          </p>
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

        {/* Post 3 */}
        <div className="post">
          <div className="post-header">
            <img src={placeholder} alt="Profile" className="profile-pic" />
            <div className="post-user">
              <strong>Luna Park</strong>
              <p>@moonmagic</p>
            </div>
          </div>
          <p className="post-content">Just another beautiful day! 🌞🌸</p>
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

        <div className="post">
          <div className="post-header">
            <img src={placeholder} alt="Profile" className="profile-pic" />
            <div className="post-user">
              <strong>Esperanza Rising</strong>
              <p>@thatonepersonfromthebook</p>
            </div>
          </div>
          <p className="post-content">
            blah blah blah blah blah blah blah blah blah blah blah blah blah
            blah blah blah blah!
          </p>
          <div className="post-images">
            <img src={empty} alt="Post" className="post-img" />
            <img src={empty} alt="Post" className="post-img" />
            <img src={empty} alt="Post" className="post-img" />
          </div>
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
