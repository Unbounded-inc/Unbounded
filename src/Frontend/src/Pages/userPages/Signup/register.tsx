import React, {useState} from 'react';
import '../../../Styles/register.css';
import { useNavigate } from 'react-router-dom';
import logoImage from "../../../assets/whitelogo.png";
import axios from "axios";

const Register: React.FC = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword]  = useState("")
    const [error, setError]  = useState("")
    const [success, setSuccess]  = useState("")

    const handleSignUp = async () => {
        setError("");
        setSuccess("");

        if (!email || !password || !firstName || !lastName) {
            setError("Please fill in all required fields.");
            console.log("Missing input fields!");
            return;
        }

        try {
            console.log("Sending signup request to Auth0...");
            const response = await axios.post(
              `https://${import.meta.env.VITE_AUTH0_DOMAIN}/dbconnections/signup`,
              {
                  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                  email: email,
                  password: password,
                  connection: "Username-Password-Authentication",
                  given_name: firstName,
                  family_name: lastName
              },
              {
                  headers: { "Content-Type": "application/json" }
              }
            );

            console.log("Signup success:", response.data);
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate('/'), 3000);
        } catch (err: any) {
            console.error("Signup failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Signup failed. Try again.");
        }
    };



    return (
    <div className="register-container">
        <img src={logoImage} className="register-logo" alt="Logo" />
        <div className="register-box">
            <h2 className="register-title">Create an Account</h2>
            <h2 style={{ margin: 5, padding: 0, color: "#888888", fontSize: "14px" }}>⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯</h2>
            <div className="register-form">
                <div className="name-fields">
                    <input className="textfield half-width" type="text" placeholder="First Name" value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}/>
                    <input className="textfield half-width" type="text" placeholder="Last Name" value={lastName}
                           onChange={(e) => setLastName(e.target.value)}/>
                </div>
                <input className="textfield" type="text" placeholder="Username"/>
                <input className="textfield" type="email" placeholder="Email" value={email}
                       onChange={(e) => setEmail(e.target.value)}/>
                <input className="textfield" type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <input className="textfield" type="password" placeholder="Re-enter Password"/>
                <input className="textfield" type="text" placeholder="Phone Number" />

                <div className="terms">
                    <input type="checkbox" id="terms" />
                    <label htmlFor="terms" className="terms-label">I agree to the general terms and conditions of use.</label>
                </div>
                
                <button className="login-button" onClick={handleSignUp}>Sign Up</button>
                <button className="register-button" onClick={() => navigate('/')}>Back to Login</button>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </div>
        </div>
    </div>
    );
};

export default Register;
