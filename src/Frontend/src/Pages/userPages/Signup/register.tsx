import React from 'react';
import '../../../Styles/register.css';
import { useNavigate } from 'react-router-dom';
import logoImage from "../../../assets/whitelogo.png";

const Register: React.FC = () => {
    const navigate = useNavigate();

    return (
      <div className="register-container">
        <img src={logoImage} className="register-logo" alt="Logo" />
        <div className="register-box">
          <h2 className="register-title">Create an Account</h2>
          <h2 style={{ margin: 5, padding: 0, color: "#888888", fontSize: "14px" }}>⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯</h2>
          <div className="register-form">
            <div className="name-fields">
              <input className="textfield half-width" type="text" placeholder="First Name" />
              <input className="textfield half-width" type="text" placeholder="Last Name" />
            </div>
            <input className="textfield" type="text" placeholder="Username" />
            <input className="textfield" type="email" placeholder="Email" />
            <input className="textfield" type="password" placeholder="Password" />
            <input className="textfield" type="password" placeholder="Re-enter Password" />
            <input className="textfield" type="text" placeholder="Phone Number" />
            
            <div className="terms">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms" className="terms-label">I agree to the general terms and conditions of use.</label>
            </div>
            
            <button className="register-button">Sign Up</button>
            <button className="login-button" onClick={() => navigate('/')}>Back to Login</button>
          </div>
        </div>
      </div>
    );
};

export default Register;
