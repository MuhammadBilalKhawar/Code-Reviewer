import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL ||
            "https://code-review-szuc.onrender.com"
          }/auth/me`
        );
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const savedNotifications =
      localStorage.getItem("notifications") !== "false";
    setNotifications(savedNotifications);
  }, []);

  const handleThemeChange = (dark) => {
    toggleTheme(dark);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue.toString());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading settings...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className={`p-8 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        } min-h-screen transition-colors`}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 animate-fade-in-down">
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              Settings
            </h1>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Configure your preferences and account
            </p>
          </div>

          {/* Profile Section */}
          <section
            className={`${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } rounded-xl border shadow-sm overflow-hidden mb-8 transition-colors animate-fade-in-up`}
          >
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-slate-700 bg-linear-to-r from-blue-900/20 to-blue-800/20"
                  : "border-slate-200 bg-linear-to-r from-blue-50 to-blue-100"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Profile
              </h2>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-linear-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {user?.name || "User"}
                    </h3>
                    <p
                      className={`${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {user?.email || "No email"}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-slate-500" : "text-slate-500"
                      } mt-2`}
                    >
                      Joined{" "}
                      {new Date(user?.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-6 py-2 ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } rounded-lg transition-all font-semibold hover-scale`}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section
            className={`${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } rounded-xl border shadow-sm overflow-hidden mb-8 transition-colors animate-fade-in-up`}
          >
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-slate-700 bg-linear-to-r from-purple-900/20 to-purple-800/20"
                  : "border-slate-200 bg-linear-to-r from-purple-50 to-purple-100"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Appearance
              </h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-1`}
                  >
                    Color Theme
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex gap-3">
                  {[
                    { value: false, label: "Light", icon: "☀️" },
                    { value: true, label: "Dark", icon: "🌙" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleThemeChange(opt.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover-scale ${
                        isDark === opt.value
                          ? "bg-purple-600 text-white shadow-lg"
                          : isDark
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section
            className={`${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } rounded-xl border shadow-sm overflow-hidden mb-8 transition-colors animate-fade-in-up`}
          >
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-slate-700 bg-linear-to-r from-green-900/20 to-green-800/20"
                  : "border-slate-200 bg-linear-to-r from-green-50 to-green-100"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Notifications
              </h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-1`}
                  >
                    Review Notifications
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Get notified when code reviews are complete
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={handleNotificationsToggle}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-14 h-8 ${
                      isDark
                        ? "bg-slate-600 peer-focus:ring-purple-800"
                        : "bg-slate-200 peer-focus:ring-purple-300"
                    } peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-purple-600`}
                  ></div>
                </label>
              </div>
            </div>
          </section>

          {/* Connected Accounts Section */}
          <section
            className={`${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } rounded-xl border shadow-sm overflow-hidden mb-8 transition-colors animate-fade-in-up`}
          >
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-slate-700 bg-linear-to-r from-orange-900/20 to-orange-800/20"
                  : "border-slate-200 bg-linear-to-r from-orange-50 to-orange-100"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Connected Accounts
              </h2>
            </div>
            <div className="p-8">
              <div
                className={`flex items-center justify-between p-4 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600"
                    : "bg-slate-50 border-slate-200"
                } rounded-lg border`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${
                      isDark ? "bg-slate-600" : "bg-slate-900"
                    } rounded-lg flex items-center justify-center`}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      GitHub
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Connected as {user?.login || user?.name}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 ${
                    isDark
                      ? "text-red-400 hover:bg-red-900/20"
                      : "text-red-600 hover:bg-red-50"
                  } rounded-lg font-semibold transition-all hover-scale`}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section
            className={`${
              isDark
                ? "bg-red-900/20 border-red-800/30"
                : "bg-red-50 border-red-200"
            } rounded-xl border shadow-sm overflow-hidden transition-colors animate-fade-in-up`}
          >
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-red-800/30 bg-red-900/30"
                  : "border-red-200 bg-red-100"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-red-400" : "text-red-900"
                }`}
              >
                ⚠️ Danger Zone
              </h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-1`}
                  >
                    Delete Account
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  className={`px-6 py-2 ${
                    isDark
                      ? "bg-red-700 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg transition-all font-semibold hover-scale`}
                >
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
