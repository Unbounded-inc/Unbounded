import React, { useState } from "react";
import "../../../Styles/nav/welcome.css";
import { useNavigate } from 'react-router-dom';
import handsImage from "../../../assets/hands.png";
import logoImage from "../../../assets/whitelogo.png";
import colorLogo from "../../../assets/UnboundedColor.png";
import LoginButton from "../../../components/Auth/LoginButton";
import ResetPasswordModal from "../../../components/PageComponets/ResetPasswordModal";

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={logoImage} className="logo" alt="Unbounded Logo" />
        <div className="welcome-text">
          <h2 className="inspiration">No limits, no labels. Build your</h2>
          <h1 className="highlight">COMMUNITY</h1>
          <h2 className="inspiration">to inspire and connect.</h2>
          <h1 className="highlight">SIMPLY BE YOU.</h1>
        </div>
        <img src={handsImage} className="hands" alt="Hands Illustration" />
      </div>

      <div className="right-panel">
        <img src={colorLogo} className="large-logo" alt="Color Logo" />
        <div className="login-box">
          <h2 className="login-title">Sign In</h2>

          <input
            className="textfield"
            type="email"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="textfield"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p 
            style={{ fontSize: "0.9rem", color: "#4c569e", margin: "5px", cursor: "pointer" }} 
            onClick={() => setShowModal(true)}
          >
            Forgot Password?
          </p>

          <div style={{ width: "50%", margin: "5px" }} className="login-butto">
            <LoginButton email={email} password={password} onSuccess={() => navigate("/feed")}
            />
          </div>

          <span className="or">⎯⎯⎯⎯⎯⎯ or ⎯⎯⎯⎯⎯⎯</span>
          <button 
            className="register-button" 
            style={{ width: "50%", margin: "5px" }} 
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>

      <ResetPasswordModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default Welcome;