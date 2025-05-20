import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../lib/UserContext";
import "../../Styles/feed/Feed.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";
import icon from "../../assets/icon.png";
import heart from "../../assets/like.png";
import comment from "../../assets/comments.png";
import share from "../../assets/shares.png";
import PostTextBox from "../../components/PageComponets/PostTextBox";
import NotificationSidebar from "../../components/PageComponets/NotificationSidebar";

const Feed: React.FC = () => {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);

  const fetchFriendsPosts = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/posts/friends/${user.id}`);
      const data = await res.json();
      setPosts(
        data.posts.map((post: any) => ({
          ...post,
          likedByCurrentUser: post.liked_by_ids?.includes(user.id),
          likeCount: Number(post.like_count) || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load friends' posts:", err);
    }
  };


  const fetchAllPosts = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/posts");
      const data = await res.json();
      setPosts(
        data.posts.map((post: any) => ({
          ...post,
          likedByCurrentUser: post.liked_by_ids?.includes(user?.id),
          likeCount: Number(post.like_count) || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAllPosts();
    })();
  }, []);



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
      is_anonymous: user.is_anonymous,
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
    const files = fileInputRef.current?.files;
    if (!files) return;

    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      const files = Array.from(fileInputRef.current.files || []);
      files.splice(index, 1);
      files.forEach((file) => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    }
  };

  const handleUpload = async () => {
    if (!postText.trim() || !user) return;

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("content", postText);
    formData.append("is_anonymous", user.is_anonymous.toString());

    if (fileInputRef.current?.files) {
      Array.from(fileInputRef.current.files).forEach((file) => {
        formData.append("images", file);
      });
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
        setPosts(
          refreshed.posts.map((post: any) => ({
            ...post,
            likedByCurrentUser: post.liked_by_ids?.includes(user?.id),
            likeCount: Number(post.like_count) || 0,
          }))
        );
        setPostText("");
        setPreviewUrls([]);
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
        headers: { "Content-Type": "application/json" },
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
      <NotificationSidebar />

      <main className="feed-content">
        <div className="feed-header">
          <h2>Home Feed</h2>
          <div className="feed-nav-options">
            <select defaultValue="">
              <option value="" disabled hidden>Communities</option>
              <option value="carti">Carti Fan</option>
            </select>
            <button
              className={`hover-btn ${showOnlyFriends ? "active-filter" : ""}`}
              onClick={async () => {
                await fetchFriendsPosts();
                setShowOnlyFriends(true);
              }}
            >
              Friends
            </button>
            <button
              className={`hover-btn ${!showOnlyFriends ? "active-filter" : ""}`}
              onClick={async () => {
                await fetchAllPosts();
                setShowOnlyFriends(false);
              }}
            >
              All
            </button>
          </div>
        </div>

        <div className="new-post">
          <img
            src={user?.profile_picture || placeholder}
            alt="Profile"
            className="profile-pic"
          />
          <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
            {user?.is_anonymous && (
              <p style={{ fontStyle: "italic", color: "#777", marginBottom: "0.5rem" }}>
                You are posting anonymously
              </p>
            )}
            <PostTextBox postText={postText} onChange={handleInputChange}/>
            {previewUrls.length > 0 && (
              <div className="preview-container">
                {previewUrls.map((url, idx) => (
                  <div key={idx} style={{position: "relative", display: "inline-block" }}>
                    <img src={url} alt={`Preview ${idx}`} className="preview-img" />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="remove-image-btn"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="button-row">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={icon} alt="icon" style={{ width: "40px", height: "40px" }} />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button type="button" className="new-btn" onClick={() => fileInputRef.current?.click()}>
                  Photo
                </button>
              </div>
              <button className="upload-btn" onClick={handleUpload}>Upload</button>
            </div>
          </div>
        </div>

        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <img
                src={post.is_anonymous ? placeholder : post.profile_picture}
                alt="Profile"
                className="profile-pic"
              />
              <div className="post-user">
                <strong>{post.display_name}</strong>
                {!post.is_anonymous && <p>@{post.display_name}</p>}
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
              <div className="post-images">
                {post.image_urls.map((url: string, idx: number) => (
                  <img key={idx} src={url} alt={`Post ${idx}`} className="post-img" />
                ))}
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
            <p className="tweet-modal-text">@{selectedPost.display_name}</p>
            {Array.isArray(selectedPost.image_urls) && selectedPost.image_urls.length > 0 && (
              <div className="post-images">
                {selectedPost.image_urls.map((url: string, idx: number) => (
                  <img key={idx} src={url} alt={`Post Detail ${idx}`} className="post-img"/>
                ))}
              </div>
            )}
            <div className="tweet-modal-comment-box">
              <img src={user?.profile_picture || placeholder} alt="profile" className="profile-pic"/>
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
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="comment"
                >
                  <img
                    src={
                      comment.is_anonymous
                        ? placeholder
                        : comment.profile_picture || placeholder
                    }
                    alt="pfp"
                    className="profile-pic"
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: "#333" }}>
                      {comment.is_anonymous
                        ? comment.anonymous_alias
                        : comment.display_name}
                    </p>
                    <p style={{ margin: 0, color: "#444", fontSize: "0.95rem" }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
