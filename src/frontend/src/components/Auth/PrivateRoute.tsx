import React from "react";
import { Navigate } from "react-router-dom";

// Function to check if user is authenticated (API-based)
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken"); // Retrieve token
  return !!token; // Returns true if token exists
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
