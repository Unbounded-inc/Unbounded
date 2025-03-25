import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/profile.css";

interface User {
  id: string;
  username: string;
  bio: string;
  profile_picture: string;
  privacy: string;
  notifications: boolean;
  anonymity: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/users/users");
        const data = await response.json();

        if (data.users && data.users.length > 0) {
          setUser(data.users[0]); // Assuming the first user for now
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Convert uploaded image to Base64 and update user data
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser((prevUser) =>
          prevUser ? { ...prevUser, profile_picture: base64String } : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile data to backend
  const handleSave = async () => {
    if (!user) return;
  
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/edit/${user.id}`, // Make sure this route matches your backend
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            bio: user.bio,
            privacy: user.privacy,
            notifications: user.notifications,
            anonymity: user.anonymity,
            profilePicture: user.profile_picture, // Make sure the key matches the backend
          }),
        }
      );
  
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