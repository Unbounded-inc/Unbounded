import React, { useState, useEffect } from 'react';
import '../../../Styles/profile/register.css';
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

    const [allCommunities, setAllCommunities] = useState<any[]>([]);
    const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

    useEffect(() => {
        fetch("http://localhost:5001/api/communities")
          .then(res => res.json())
          .then(data => setAllCommunities(data.communities))
          .catch(err => console.error("Failed to load communities:", err));
    }, []);

    const toggleCommunity = (id: string) => {
        setSelectedCommunities(prev =>
          prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const handleSignUp = async () => {
        setError("");
        setSuccess("");

        if (!firstName || !lastName || !username || !email || !password || !phoneNumber) {
            setError("Please fill in all fields.");
            return;
        }

        const cleanedPhone = phoneNumber.replace(/\D/g, '');

        try {
            const response = await axios.post("http://localhost:5001/api/users/add", {
                username,
                email,
                phoneNumber: `${areaCode}${cleanedPhone}`,
                password,
                firstName,
                lastName,
                community_ids: selectedCommunities,
            });

            console.log("Signup success:", response.data);
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

                  <div className="form-group">
                      <label style={{ marginBottom: "5px" }}>Select Communities:</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1rem" }}>
                          {allCommunities.map((community) => {
                              const selected = selectedCommunities.includes(community.id);
                              return (
                                <span
                                  key={community.id}
                                  onClick={() => toggleCommunity(community.id)}
                                  style={{
                                      padding: "6px 12px",
                                      borderRadius: "15px",
                                      backgroundColor: selected ? "#2c2456" : "#e6e6ff",
                                      color: selected ? "white" : "#333",
                                      cursor: "pointer",
                                      fontSize: "14px"
                                  }}
                                >
                    {community.name}
                  </span>
                              );
                          })}
                      </div>
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
