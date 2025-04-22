import React from "react";
import "../../Styles/Friends.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";

const Friends: React.FC = () => {
  const friends = [
    { id: 1, name: "Isabel Vega", handle: "@isabel" },
    { id: 2, name: "Calvin Nunez", handle: "@calvin" },
    { id: 3, name: "Manny Lopez", handle: "@manny" },
    { id: 4, name: "Arsen Reyes", handle: "@arsen" },
    { id: 5, name: "Nina Rivera", handle: "@ninariv" },
  ];

  const requests = [
    { id: 6, name: "Lana Kim", handle: "@lanak" },
    { id: 7, name: "David Tran", handle: "@dtran" },
  ];

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content">
        <h2 className="friends-title">Friends</h2>

        <div className="friends-search-bar">
          <input
            type="text"
            placeholder="Search for a user..."
            className="friends-search-input"
          />
          <button className="add-friend-btn">Add</button>
        </div>

        <div className="friends-sections">
          <div className="friends-list-section">
            <h3 className="section-subtitle">All Friends:</h3>
            {friends.map((friend) => (
              <div key={friend.id} className="friend-entry">
                <img src={placeholder} alt="pfp" className="friend-pfp" />
                <div className="friend-text">
                  <strong>{friend.name}</strong>
                  <p>{friend.handle}</p>
                </div>
                <div className="friend-actions">
                  <button className="view-btn">View</button>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="requests-section">
            <h3 className="section-subtitle">Incoming Requests:</h3>
            {requests.map((req) => (
              <div key={req.id} className="friend-entry">
                <img src={placeholder} alt="pfp" className="friend-pfp" />
                <div className="friend-text">
                  <strong>{req.name}</strong>
                  <p>has requested to be your friend.</p>
                </div>
                <div className="friend-actions">
                  <button className="accept-btn">Accept</button>
                  <button className="remove-btn">Delete</button>
                </div>
              </div>
            ))}
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

export default Friends;
