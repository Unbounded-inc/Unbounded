import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/profile.css";
import {getUser,updateUser,User} from "../../../lib/api.ts";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser(); // ✅ No type errors now

        if (data.users && data.users.length > 0) {
          setUser(data.users[0]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const resizeImage = (file: File, maxSize = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
  
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
  
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Failed to get canvas context");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        resolve(canvas.toDataURL("image/jpeg")); // Can be "image/png" too
      };
  
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Convert uploaded image to Base64 and update user data
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const resizedBase64 = await resizeImage(file, 300); // Resize to max 300px
      setUser((prevUser) =>
        prevUser ? { ...prevUser, profile_picture: resizedBase64 } : null
      );
    } catch (err) {
      console.error("Image resizing failed:", err);
    }
  }
};

  // Save profile data to backend
  const handleSave = async () => {
    if (!user) return;
  
    try {
      const response = await updateUser(user.id, {
        username: user.username,
        bio: user.bio,
        privacy: user.privacy,
        notifications: user.notifications,
        anonymity: user.anonymity,
        profile_picture: user.profile_picture,
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Add logout logic (clear session, tokens, etc.)
    alert("Logged out!");
    navigate("/"); // Redirect to homepage
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Error loading user data.</p>;

  return (
    <div className="profile-container">
      <div className="profile-box">
        <img
          src={user.profile_picture || "https://via.placeholder.com/100"}
          alt="Profile Avatar"
          className="profile-avatar"
        />

        {isEditing ? (
          <>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <input
              className="textfield"
              type="text"
              placeholder="Username"
              value={user.username}
              onChange={(e) =>
                setUser((prev) => prev && { ...prev, username: e.target.value })
              }
            />

            <textarea
              className="textfield bio-textarea"
              placeholder="Bio"
              value={user.bio}
              onChange={(e) =>
                setUser((prev) => prev && { ...prev, bio: e.target.value })
              }
            ></textarea>

            <label>Privacy:</label>
            <select
              value={user.privacy}
              onChange={(e) =>
                setUser((prev) => prev && { ...prev, privacy: e.target.value })
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <label>Enable Notifications:</label>
            <input
              type="checkbox"
              checked={user.notifications}
              onChange={() =>
                setUser((prev) =>
                  prev && { ...prev, notifications: !prev.notifications }
                )
              }
            />

            <label>Stay Anonymous:</label>
            <input
              type="checkbox"
              checked={user.anonymity}
              onChange={() =>
                setUser((prev) =>
                  prev && { ...prev, anonymity: !prev.anonymity }
                )
              }
            />

            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
            <button className="logout-button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2>{user.username}</h2>
            <div className="bio-container">
              <p>{user.bio || "No bio available"}</p>
            </div>
            <p>
              <strong>Privacy:</strong>{" "}
              {user.privacy === "public" ? "Public Profile" : "Private Profile"}
            </p>
            <p>
              <strong>Notifications:</strong> {user.notifications ? "Enabled" : "Disabled"}
            </p>
            <p>
              <strong>Anonymity:</strong> {user.anonymity ? "Anonymous" : "Visible"}
            </p>

            <button className="save-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;