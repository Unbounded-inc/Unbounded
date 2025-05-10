import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../../Styles/Sidebar.css";
import { FiBook, FiHome, FiLogOut, FiMap, FiMessageSquare, FiSettings, FiUser, FiUsers } from "react-icons/fi";
import ProfileIcon from "./ProfileIcon";
import { useUser } from "../../lib/UserContext"; // ✅ Import user context

interface SidebarProps {
  onHoverChange?: (hovering: boolean) => void;
}

function Sidebar({ onHoverChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const { user, logout } = useUser(); // ✅ Access user and logout from context

  const handleLogout = async () => {
    await logout(); // ✅ Clear backend + frontend session
    navigate("/");
  };

  return (
    <aside
      className={`sidebar ${isHovered ? "expanded" : ""}`}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }}
      
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(false);
      }}
    >
      {/* Profile Section */}
      <div className="profile">
        <ProfileIcon isExpanded={isHovered} />
        {isHovered && user && (
          <div className="profile-info">
            <h2 className="username">{user.first_name} {user.last_name}</h2>
            <p className="handle">@{user.username}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        <Link to="/feed" className={`nav-item ${location.pathname === "/feed" ? "active" : ""}`}>
          <FiHome className="icon" /> {isHovered && <span className="text">Home Feed</span>}
        </Link>
        <Link to="/messages" className={`nav-item ${location.pathname === "/messages" ? "active" : ""}`}>
          <FiMessageSquare className="icon" /> {isHovered && <span className="text">Messages</span>}
        </Link>
        <Link to="/forums" className={`nav-item ${location.pathname === "/forums" ? "active" : ""}`}>
          <FiBook className="icon" /> {isHovered && <span className="text">Forums</span>}
        </Link>
        <Link to="/profile" className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}>
          <FiUser className="icon" /> {isHovered && <span className="text">Account</span>}
        </Link>
        <Link to="/friends" className={`nav-item ${location.pathname === "/friends" ? "active" : ""}`}>
          <FiUsers className="icon" /> {isHovered && <span className="text">Friends</span>}
        </Link>
        <Link to="/map" className={`nav-item ${location.pathname === "/map" ? "active" : ""}`}>
          <FiMap className="icon" /> {isHovered && <span className="text">Map</span>}
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}>
          <FiSettings className="icon" /> {isHovered && <span className="text">Settings</span>}
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="logout">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut className="icon" /> {isHovered && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;