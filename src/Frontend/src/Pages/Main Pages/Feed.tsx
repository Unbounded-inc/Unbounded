import React from "react";
import "../../Styles/Feed.css";
import  "../../components/PageComponets/Sidebar.tsx";
import Sidebar from "../../components/PageComponets/Sidebar.tsx";

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
