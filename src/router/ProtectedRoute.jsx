// src/router/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();

  // Mientras comprueba el token guardado, no redirigimos aún
  if (loading) return null;

  return isAuth ? children : <Navigate to="/login" replace />;
}