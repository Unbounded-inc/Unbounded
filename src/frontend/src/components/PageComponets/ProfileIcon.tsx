import "../../Styles/ProfileIcon.css";
import UB_logo from "../../assets/UB_whiteclear.png";
import defaultProfilePic from "../../assets/greenStec.png";
import { useUser } from "../../lib/UserContext"; // ✅ pull from context

function ProfileIcon({ isExpanded }: { isExpanded: boolean }) {
  const { user } = useUser();

  // Use user's profile picture or fallback to default
  const profilePicture = user?.profile_picture || defaultProfilePic;

  return (
    <div className={`pfp-container ${isExpanded ? "expanded" : ""}`}>
      {/* Left: User's PFP */}
      <div className="circle pfp-circle">
        <img src={profilePicture} alt="User PFP" className="pfp-image" />
      </div>

      {/* Right: Unbounded Icon (only visible when expanded) */}
      {isExpanded && (
        <div className="circle logo-circle">
          <img src={UB_logo} alt="Unbounded Logo" className="logo-image" />
        </div>
      )}
    </div>
  );
}

export default ProfileIcon;