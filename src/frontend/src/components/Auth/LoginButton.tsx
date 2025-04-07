import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../../lib/UserContext"; // ✅ grab context

interface LoginButtonProps {
  email: string;
  password: string;
  onSuccess?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ email, password, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { fetchUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter either an email or username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5001/auth/login",
        { email, password },
        { withCredentials: true } // ✅ required for cookie
      );

      console.log("Login successful:", response.data);

      await fetchUser(); // ✅ immediately update context

      const id = response.data?.user?.id || response.data?.user?.auth0_id;
      if (id) {
        localStorage.setItem("auth0_id", id);
        console.log("Saved auth0_id to localStorage:", id);
      }

      if (onSuccess) onSuccess(); // ✅ optional navigation
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
        style={{
          background: "#4c569e",
          color: "white",
          padding: "8px 16px",
          border: "none",
          cursor: "pointer",
        }}
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
