import React from "react";
import "../../Styles/friends/FriendProfileModa.css";
import placeholder from "../../assets/placeholder.png";

interface FriendProfileModalProps {
  show: boolean;
  onClose: () => void;
  friend: {
    friendUsername: string;
    friendPfp: string;
    bio?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ show, onClose, friend }) => {
  if (!show || !friend) return null;

  return (
    <div className="friend-modal-overlay" onClick={onClose}>
      <div className="friend-modal-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={friend.friendPfp || placeholder}
          alt="Friend Profile"
          className="friend-modal-avatar"
        />
        <h2 style={{color:"black"}}>{friend.first_name || ""} {friend.last_name || ""}</h2>
        <h3 style={{color:"black"}}>@{friend.friendUsername}</h3>
        <p className="friend-modal-bio">{friend.bio || "No bio provided."}</p>
        <button className="friend-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default FriendProfileModal;
