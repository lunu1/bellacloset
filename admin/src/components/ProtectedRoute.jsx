// components/ProtectedRoute.jsx
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAdminLoggedIn, loading } = useContext(AdminContext);

  if (loading) return <div>Loading...</div>; // Optional loader

  if (!isAdminLoggedIn) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
