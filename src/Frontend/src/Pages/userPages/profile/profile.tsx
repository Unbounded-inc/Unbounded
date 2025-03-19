import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../Styles/profile.css';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    // Load saved data or use default values
    const [name, setName] = useState(localStorage.getItem("name") || "John Doe");
    const [bio, setBio] = useState(localStorage.getItem("bio") || "This is my bio.");
    const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "https://via.placeholder.com/100");
    const [privacy, setPrivacy] = useState(localStorage.getItem("privacy") || "public");
    const [notifications, setNotifications] = useState(localStorage.getItem("notifications") === "true");
    const [anonymity, setAnonymity] = useState(localStorage.getItem("anonymity") === "true");

    // Convert uploaded image to Base64 and save
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePic(base64String);
                localStorage.setItem("profilePic", base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save profile data to localStorage
    const handleSave = () => {
        localStorage.setItem("name", name);
        localStorage.setItem("bio", bio);
        localStorage.setItem("privacy", privacy);
        localStorage.setItem("notifications", String(notifications));
        localStorage.setItem("anonymity", String(anonymity));
        alert("Profile saved!");
        setIsEditing(false);
    };

    // Clear localStorage and log out
    const handleLogout = () => {
        localStorage.clear();
        alert("Logged out! Profile deleted.");
        navigate('/'); // Redirect to homepage
    };

    return (
        <div className="profile-container">
            <div className="profile-box">
                <img src={profilePic} alt="Profile Avatar" className="profile-avatar" />

                {isEditing ? (
                    <>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        <input className="textfield" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

                        <textarea className="textfield bio-textarea" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                        
                        <label>Privacy:</label>
                        <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>

                        <label>Enable Notifications:</label>
                        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />

                        <label>Stay Anonymous:</label>
                        <input type="checkbox" checked={anonymity} onChange={() => setAnonymity(!anonymity)} />

                        <button className="save-button" onClick={handleSave}>Save Changes</button>
                        <button className="logout-button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                ) : (
                    <>
                        <h2>{name}</h2>
                        <div className="bio-container">
                            <p>{bio}</p>
                        </div>
                        <p><strong>Privacy:</strong> {privacy === "public" ? "Public Profile" : "Private Profile"}</p>
                        <p><strong>Notifications:</strong> {notifications ? "Enabled" : "Disabled"}</p>
                        <p><strong>Anonymity:</strong> {anonymity ? "Anonymous" : "Visible"}</p>
                        
                        <button className="save-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                        <button className="logout-button" onClick={handleLogout}>Log Out</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
