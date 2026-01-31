import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");

        setUser(userData);

        const statsRes = await api.get(`/api/reviews/stats`);

        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div
        className={`p-8 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        } min-h-screen transition-colors`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              Welcome back, {user?.login || "Developer"}!
            </h1>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Here's your code review activity
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4`}
              ></div>
              <p
                className={`${
                  isDark ? "text-slate-400" : "text-slate-600"
                } text-lg`}
              >
                Loading your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
                {/* Total Reviews Card */}
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow hover-lift animate-fade-in-up`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${
                        isDark ? "bg-blue-900/30" : "bg-blue-100"
                      } rounded-lg`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isDark ? "text-slate-400" : "text-slate-600"
                        } text-sm font-medium`}
                      >
                        Total Reviews
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.totalReviews || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRs Analyzed Card */}
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow hover-lift animate-fade-in-up`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${
                        isDark ? "bg-green-900/30" : "bg-green-100"
                      } rounded-lg`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isDark ? "text-slate-400" : "text-slate-600"
                        } text-sm font-medium`}
                      >
                        PRs Analyzed
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.prsAnalyzed || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* High Severity Issues Card */}
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow hover-lift animate-fade-in-up`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${
                        isDark ? "bg-red-900/30" : "bg-red-100"
                      } rounded-lg`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isDark ? "text-slate-400" : "text-slate-600"
                        } text-sm font-medium`}
                      >
                        High Severity
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.highSeverity || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avg Review Time Card */}
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow hover-lift animate-fade-in-up`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${
                        isDark ? "bg-purple-900/30" : "bg-purple-100"
                      } rounded-lg`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isDark ? "text-slate-400" : "text-slate-600"
                        } text-sm font-medium`}
                      >
                        Avg Review Time
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.avgTime || 0}s
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-stagger">
                {/* Start New Review */}
                <div
                  className="bg-linear-to-br from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover-lift hover-glow animate-fade-in-up"
                  onClick={() => navigate("/repositories")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Start New Review
                      </h3>
                      <p className="text-purple-100">
                        Browse and analyze repositories
                      </p>
                    </div>
                    <svg
                      className="w-12 h-12 opacity-50"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* View Statistics */}
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl p-8 border shadow-sm hover:shadow-md transition-shadow hover-lift animate-fade-in-up`}
                >
                  <h3
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-2`}
                  >
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`flex justify-between items-center p-3 ${
                        isDark ? "bg-slate-700" : "bg-slate-50"
                      } rounded-lg`}
                    >
                      <span
                        className={`${
                          isDark ? "text-slate-300" : "text-slate-600"
                        } font-medium`}
                      >
                        Reviews This Week
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.thisWeek || 0}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between items-center p-3 ${
                        isDark ? "bg-slate-700" : "bg-slate-50"
                      } rounded-lg`}
                    >
                      <span
                        className={`${
                          isDark ? "text-slate-300" : "text-slate-600"
                        } font-medium`}
                      >
                        Avg Issues Per Review
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stats?.avgIssues || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reviews Section */}
              <div
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm animate-fade-in-up`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Recent Reviews
                  </h2>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm mt-1`}
                  >
                    Your latest code analyses
                  </p>
                </div>

                {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                  <div
                    className={`divide-y ${
                      isDark ? "divide-slate-700" : "divide-slate-200"
                    } animate-stagger`}
                  >
                    {stats.recentReviews.map((review, idx) => (
                      <div
                        key={review.id || idx}
                        className={`p-6 ${
                          isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        } transition-colors cursor-pointer hover-lift animate-fade-in-up`}
                        onClick={() => navigate(`/reviews/${review.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {review.owner}/{review.repository}
                            </h3>
                            <p
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {review.prNumber
                                ? `PR #${review.prNumber}`
                                : "Commit Review"}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              review.severity === "high"
                                ? isDark
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-red-100 text-red-700"
                                : review.severity === "medium"
                                ? isDark
                                  ? "bg-amber-900/30 text-amber-400"
                                  : "bg-amber-100 text-amber-700"
                                : isDark
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {review.severity} severity
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span
                            className={`text-sm ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {review.issueCount} issue
                            {review.issueCount !== 1 ? "s" : ""} found
                          </span>
                          <span
                            className={`text-sm ${
                              isDark ? "text-slate-500" : "text-slate-500"
                            }`}
                          >
                            {review.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg
                      className={`w-16 h-16 ${
                        isDark ? "text-slate-600" : "text-slate-300"
                      } mx-auto mb-4`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                    <p
                      className={`${
                        isDark ? "text-slate-400" : "text-slate-600"
                      } text-lg font-medium`}
                    >
                      No recent reviews
                    </p>
                    <p
                      className={`${
                        isDark ? "text-slate-500" : "text-slate-500"
                      } text-sm mt-1`}
                    >
                      Start by analyzing a repository
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
