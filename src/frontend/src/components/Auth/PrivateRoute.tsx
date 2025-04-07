import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../lib/UserContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <p>Loading...</p>; // Or your own loading spinner
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
