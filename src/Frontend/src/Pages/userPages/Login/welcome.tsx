import React from "react";
import "../styles/welcome.css"; // Ensure correct path
import handsImage from "../assets/hands.png";
import logoImage from "../assets/whitelogo.png";
import colorLogo from "../assets/UnboundedColor.png";

const Welcome: React.FC = () => {
  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={logoImage} className="logo" alt="Logo"/>
        <h2 className="inspiration">No limits, no labels. Build your</h2>
        <h1 className="highlight">COMMUNITY</h1>
        <h2 className="inspiration">to inspire and connect.</h2>
        <h1 className="highlight">SIMPLY BE YOU.</h1>
        <img src={handsImage} className="hands" />
      </div>
      <div className="right-panel">
        <img src={colorLogo} className="large-logo" alt="Logo"/>
        <div className="login-box">
          <h2 style={{ fontSize: "20px", margin: "5px" }}>Sign In</h2>
          <input className="textfield" type="text" placeholder="Username or Email" />
          <input className="textfield" type="password" placeholder="Password" />
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
          <button className="login-button">Log In</button>
          <span className="or">⎯⎯⎯⎯⎯⎯ or ⎯⎯⎯⎯⎯⎯</span>
          <button className="register-button">Register</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
