import React, { useEffect, useState } from "react";
import { useUser } from "../../lib/UserContext";
import Sidebar from "../../components/PageComponets/Sidebar";
import "../../Styles/feed/MyPosts.css";
import logo from "../../assets/whitelogo.png";

const MyPosts: React.FC = () => {
  const { user } = useUser();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userForums, setUserForums] = useState<any[]>([]);

  const fetchUserPosts = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/posts");
      const data = await res.json();
      setUserPosts(data.posts.filter((post: any) => post.user_id === user?.id));
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const fetchUserForums = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/forums");
      const data = await res.json();
      setUserForums(data.filter((forum: any) => forum.created_by === user?.id));
    } catch (err) {
      console.error("Failed to fetch forums:", err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Error: ${data.error}`);
        return;
      }

      setUserPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleDeleteForum = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this forum thread?")) return;

    try {
      await fetch(`http://localhost:5001/api/forums/${id}`, {
        method: "DELETE",
      });
      setUserForums((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete forum:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchUserForums();
    }
  }, [user]);

  return (
    <div className="myposts-wrapper">
      <Sidebar />
      <div className="myposts-content">
        <div style={{ textAlign: "center" }}>
          <img src={logo} alt="Logo" style={{ height: "70px" }} />
        </div>
        <div className="myposts-columns">
          <div className="myposts-left">
            <h3 className="section-title white-title">Feed Posts</h3>
            {userPosts.map((post) => (
              <div key={post.id} className="mypost-card">
                <p>{post.content}</p>
                {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
                  <div className="post-images">
                    {post.image_urls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Post ${idx}`}
                        className="mypost-image"
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="delete-btn"
                >
                  Delete Post
                </button>
              </div>
            ))}
          </div>

          <div className="myposts-right">
            <h3 className="section-title white-title">Forum Threads</h3>
            {userForums.map((forum) => (
              <div key={forum.id} className="myforum-card">
                <h4 style={{ marginBottom: "0.5rem" }}>{forum.title}</h4>
                <p>{forum.description}</p>
                <button
                  onClick={() => handleDeleteForum(forum.id)}
                  className="delete-btn"
                >
                  Delete Forum
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
