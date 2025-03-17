import React, { useState } from "react";
import axios from "axios";

// Define expected props
interface LoginButtonProps {
  email: string;
  password: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ email, password }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: "password",
          client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
          client_secret: import.meta.env.VITE_AUTH0_CLIENT_SECRET,
          username: email, // Received from props
          password: password, // Received from props
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
          connection: "Username-Password-Authentication",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Store token
      localStorage.setItem("authToken", response.data.access_token);
      console.log("Login successful:", response.data);
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.error_description || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="login-button" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LoginButton;
