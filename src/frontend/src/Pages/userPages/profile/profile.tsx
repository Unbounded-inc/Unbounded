import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Styles/profile.css";
import { updateUser } from "../../../lib/api";
import { useUser } from "../../../lib/UserContext";
import Sidebar from "../../../components/PageComponets/Sidebar.tsx";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  const [communityInput, setCommunityInput] = useState("");
  const [communities, setCommunities] = useState<string[]>([
    "Latinx", "Gamers", "Students"
  ]);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setLocalUser((prev) => ({
      ...prev!,
      [name]: newValue,
    }));
  };

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

        resolve(canvas.toDataURL("image/jpeg"));
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await resizeImage(file, 300);
        setLocalUser((prev) => prev ? { ...prev, profile_picture: resizedBase64 } : null);
      } catch (err) {
        console.error("Image resizing failed:", err);
      }
    }
  };

  const handleAddCommunity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && communityInput.trim()) {
      e.preventDefault();
      if (!communities.includes(communityInput.trim())) {
        setCommunities([...communities, communityInput.trim()]);
      }
      setCommunityInput("");
    }
  };

  const handleRemoveCommunity = (index: number) => {
    setCommunities(communities.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!localUser) return;

    try {
      const response = await updateUser(localUser.id.toString(), {
        username: localUser.username,
        bio: localUser.bio,
        profile_picture: localUser.profile_picture,
        first_name: localUser.first_name,
        last_name: localUser.last_name,
        privacy: localUser.privacy,
        anonymity: localUser.is_anonymous,
        notifications: localUser.notifications,
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
        await refreshUser();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user || !localUser) return <p>Error: Not logged in</p>;

  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-box">
        <div className="center-avatar">
          <img
            src={localUser.profile_picture || "https://via.placeholder.com/100"}
            alt="Profile Avatar"
            className="profile-avatar"
          />
        </div>

        <div className="profile-edit-row">
          <div className="profile-left">
            {isEditing ? (
              <>
                <div className="pfp-upload">
                  <label className="upload-label">Upload New Profile Picture:</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input"/>
                </div>

                <label className="upload-label">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={localUser.username}
                  onChange={handleChange}
                  className="profile-input"
                />
                <label className="upload-label">First Name:</label>
                <input
                  type="text"
                  name="first_name"
                  value={localUser.first_name || ""}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="First Name"
                />
                <label className="upload-label">Last Name:</label>
                <input
                  type="text"
                  name="last_name"
                  value={localUser.last_name || ""}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="Last Name"
                />
               
                <div>
                  <label className="upload-label">
                    Stay Anonymous?
                    <input
                      type="checkbox"
                      name="is_anonymous"
                      checked={localUser.is_anonymous}
                      onChange={handleChange}
                      className="box"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <h2 style={{margin:'10px'}}>{localUser.first_name} {localUser.last_name}</h2>
                <h3 style={{margin:'10px'}}>{localUser.username}</h3>
                <p style={{margin:'10px'}}>{localUser.bio || "No bio provided."}</p>
                <p style={{margin:'10px'}}><strong>Email:</strong> {localUser.email}</p>
                <p style={{margin:'10px', marginBottom:"15px"}}><strong>Anonymous:</strong> {localUser.is_anonymous ? "Yes" : "No"}</p>
                <button style={{backgroundColor:"#2c2456"}} onClick={handleEditToggle}>Edit Profile</button>
                <button className="logout-button" onClick={handleLogout}>Log Out</button>
              </>
            )}
          </div>

          {isEditing && (
            <div className="profile-right">
              <label className="upload-label">Biography:</label>
              <textarea
                name="bio"
                value={localUser.bio || ""}
                onChange={handleChange}
                className="profile-textarea"
                placeholder="Your bio..."
              />
              <label className="upload-label">Communities:</label>
              <input
                type="text"
                placeholder="Type and press Enter"
                className="community-input"
                value={communityInput}
                onChange={(e) => setCommunityInput(e.target.value)}
                onKeyDown={handleAddCommunity}
              />
              <div className="community-tag-list">
                {communities.map((tag, index) => (
                  <div key={index} className="community-tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveCommunity(index)}
                      className="community-tag-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="edit-buttons-wrapper">
            <button style={{backgroundColor:"rgb(76, 86, 158)"}} onClick={handleSave}>Save</button>
            <button style={{backgroundColor:"#2c2456"}} onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
