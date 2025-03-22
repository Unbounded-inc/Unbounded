import React from "react";
import "../../Styles/Feed.css";
import Sidebar from "../../components/PageComponets/Sidebar";

const Feed: React.FC = () => {
  return (
    <div className="feed-container">
      <Sidebar />
      <main className="feed-content">
        <p>Hello</p>
      </main>
    </div>
  );
};

export default Feed;
