// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedin, userData, authLoading } = useContext(AppContext);
  const location = useLocation();

  // while checking auth, don’t redirect yet (prevents flicker)
  if (authLoading) {
    return <div className="p-6 text-sm text-gray-500">Checking your session…</div>;
  }

  if (!isLoggedin || !userData) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
