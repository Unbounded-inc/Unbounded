import React, { useState } from "react";
import axios from "axios";

interface LoginButtonProps {
  email: string;
  password: string;
  onSuccess?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ email, password, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter either an email or username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      const { access_token, id_token } = response.data;

      // Store tokens in localStorage
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("idToken", id_token);

      console.log("Login successful:", response.data);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        style={{ background: "#4c569e", color: "white", padding: "8px 16px", border: "none", cursor: "pointer" }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
      {error && <p className="error" style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginButton;
