import React, { useState } from 'react';
import '../../../Styles/register.css';
import { useNavigate } from 'react-router-dom';
import logoImage from "../../../assets/whitelogo.png";
import axios from "axios";

const Register: React.FC = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [areaCode, setAreaCode] = useState("+1");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignUp = async () => {
        setError("");
        setSuccess("");

        if (!firstName || !lastName || !username || !email || !password || !phoneNumber) {
            setError("Please fill in all fields.");
            return;
        }

        const cleanedPhone = phoneNumber.replace(/\D/g, ''); // remove non-numeric chars

        try {
            const response = await axios.post("http://localhost:5001/api/users/add", {
                username,
                email,
                phoneNumber: `${areaCode}${cleanedPhone}`,
                password,
                firstName,
                lastName,
            });

            console.log("Signup success:", response.data);
            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => navigate("/"), 3000);
        } catch (err: any) {
            console.error("Signup failed:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Signup failed. Try again.");
        }
    };

    return (
        <div className="register-container">
            <img src={logoImage} className="register-logo" alt="Logo" />
            <div className="register-box">
                <h2 className="register-title">Create an Account</h2>
                <h2 style={{ margin: 5, padding: 0, color: "#888888", fontSize: "14px" }}>
                    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
                </h2>
                <div className="register-form">
                    <div className="name-fields">
                        <input className="textfield half-width" type="text" placeholder="First Name" value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} />
                        <input className="textfield half-width" type="text" placeholder="Last Name" value={lastName}
                            onChange={(e) => setLastName(e.target.value)} />
                    </div>

                    <input className="textfield" type="text" placeholder="Username" value={username}
                        onChange={(e) => setUsername(e.target.value)} />

                    <input className="textfield" type="email" placeholder="Email" value={email}
                        onChange={(e) => setEmail(e.target.value)} />

                    <input className="textfield" type="password" placeholder="Password" value={password}
                        onChange={(e) => setPassword(e.target.value)} />

                    <div className="phone-row">
                        <select
                            className="textfield3"
                            value={areaCode}
                            onChange={(e) => setAreaCode(e.target.value)}
                        >
                            <option value="+1">+1 (US)</option>
                            <option value="+52">+52 (MX)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+91">+91 (IN)</option>
                            <option value="+81">+81 (JP)</option>
                        </select>
                        <input
                            className="textfield2"
                            type="text"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

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
