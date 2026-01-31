import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL ||
            "https://code-review-szuc.onrender.com"
          }/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      {/* Sidebar */}
      <aside
        className={`w-64 ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } border-r flex flex-col shadow-sm transition-colors`}
      >
        {/* Brand */}
        <div
          className={`p-6 border-b ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-linear-to-br from-purple-600 to-indigo-600 rounded-lg">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </div>
            <div>
              <h1
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                CodeReview
              </h1>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/dashboard")
                ? `${
                    isDark
                      ? "bg-purple-900/40 text-purple-400"
                      : "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700"
                  } border-l-4 border-purple-600`
                : `${
                    isDark
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/repositories"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/repositories")
                ? `${
                    isDark
                      ? "bg-purple-900/40 text-purple-400"
                      : "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700"
                  } border-l-4 border-purple-600`
                : `${
                    isDark
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="font-medium">Repositories</span>
          </Link>

          <Link
            to="/documentation"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/documentation")
                ? `${
                    isDark
                      ? "bg-purple-900/40 text-purple-400"
                      : "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700"
                  } border-l-4 border-purple-600`
                : `${
                    isDark
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z" />
            </svg>
            <span className="font-medium">Documentation</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/settings")
                ? `${
                    isDark
                      ? "bg-purple-900/40 text-purple-400"
                      : "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700"
                  } border-l-4 border-purple-600`
                : `${
                    isDark
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            isDark
              ? "border-slate-700 text-slate-500"
              : "border-slate-200 text-slate-500"
          } text-center text-xs`}
        >
          v0.2.1
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`h-16 ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          } border-b flex items-center justify-between px-6 shadow-sm transition-colors`}
        >
          <button
            className={`p-2 ${
              isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"
            } rounded-lg transition-colors lg:hidden`}
          >
            <svg
              className={`w-6 h-6 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {getInitials(user?.name)}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div
                    className={`text-sm font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {user?.name || "Loading..."}
                  </div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {user?.email || ""}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`p-2 ${
                isDark
                  ? "text-slate-400 hover:bg-red-900/30 hover:text-red-400"
                  : "text-slate-600 hover:bg-red-50 hover:text-red-600"
              } rounded-lg transition-colors`}
              title="Logout"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 overflow-auto ${
            isDark ? "bg-slate-900" : "bg-slate-50"
          } transition-colors`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
