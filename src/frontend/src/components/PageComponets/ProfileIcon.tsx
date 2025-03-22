import "../../Styles/ProfileIcon.css"
import UB_logo from "../../assets/UB_whiteclear.png"
import testProfilePic from "../../assets/greenStec.png";



function ProfileIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className={`pfp-container ${isExpanded ? "expanded" : ""}`}>
      {/* Left: User's PFP */}
      <div className="circle pfp-circle">
        <img src= {testProfilePic} alt="User PFP" className="pfp-image" />
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