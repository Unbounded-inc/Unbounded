import React, { useState } from "react";
import "../../../Styles/welcome.css";
import { useNavigate } from 'react-router-dom';
import handsImage from "../../../assets/hands.png";
import logoImage from "../../../assets/whitelogo.png";
import colorLogo from "../../../assets/UnboundedColor.png";
import LoginButton from "../../../components/Auth/LoginButton"; // Keep original styling

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  // State for user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-container">
      {/* Left Panel */}
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

      {/* Right Panel */}
      <div className="right-panel">
        <img src={colorLogo} className="large-logo" alt="Color Logo" />
        <div className="login-box">
          <h2 className="login-title">Sign In</h2>

          {/* Controlled Inputs */}
          <input
            className="textfield"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="textfield"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Pass email & password to LoginButton */}
          <LoginButton email={email} password={password}/>

          <span className="or">⎯⎯⎯⎯⎯⎯ or ⎯⎯⎯⎯⎯⎯</span>
          <button className="register-button" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
