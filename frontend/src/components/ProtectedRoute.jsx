import React from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return children;
  }
  return <Navigate to="/" replace />;
}
