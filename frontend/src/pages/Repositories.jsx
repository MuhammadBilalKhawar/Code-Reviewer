import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function Repositories() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get(`/api/github/repos`);
        setRepos(res.data || []);
      } catch (err) {
        console.error("Failed to fetch repos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLanguageColor = (lang) => {
    const colors = {
      JavaScript: isDark
        ? "bg-yellow-900/30 text-yellow-400"
        : "bg-yellow-100 text-yellow-800",
      TypeScript: isDark
        ? "bg-blue-900/30 text-blue-400"
        : "bg-blue-100 text-blue-800",
      Python: isDark
        ? "bg-blue-900/30 text-blue-400"
        : "bg-blue-100 text-blue-800",
      Java: isDark
        ? "bg-orange-900/30 text-orange-400"
        : "bg-orange-100 text-orange-800",
      Go: isDark ? "bg-cyan-900/30 text-cyan-400" : "bg-cyan-100 text-cyan-800",
      Rust: isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-800",
      Ruby: isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-800",
      PHP: isDark
        ? "bg-purple-900/30 text-purple-400"
        : "bg-purple-100 text-purple-800",
      CSS: isDark
        ? "bg-pink-900/30 text-pink-400"
        : "bg-pink-100 text-pink-800",
      HTML: isDark
        ? "bg-orange-900/30 text-orange-400"
        : "bg-orange-100 text-orange-800",
    };
    return (
      colors[lang] ||
      (isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-800")
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Layout>
      <div
        className={`p-8 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        } min-h-screen transition-colors`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              Repositories
            </h1>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Connect and analyze your GitHub repositories
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 animate-fade-in-down">
            <div className="relative">
              <svg
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search repositories by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-6 py-3 ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-500"
                } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p
                className={`${
                  isDark ? "text-slate-400" : "text-slate-600"
                } text-lg font-medium`}
              >
                Loading repositories...
              </p>
            </div>
          ) : (
            <>
              {filteredRepos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => {
                        const [ownerName, repoName] = [
                          repo.owner.login,
                          repo.name,
                        ];
                        navigate(`/repos/${ownerName}/${repoName}`);
                      }}
                      className={`${
                        isDark
                          ? "bg-slate-800 border-slate-700 hover:border-purple-400"
                          : "bg-white border-slate-200 hover:border-purple-300"
                      } rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 p-6 cursor-pointer group hover-lift animate-fade-in-up`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 ${
                            isDark
                              ? "bg-purple-900/30 group-hover:bg-purple-900/50"
                              : "bg-purple-100 group-hover:bg-purple-200"
                          } rounded-lg transition-colors`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              isDark ? "text-purple-400" : "text-purple-600"
                            }`}
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"
                            />
                          </svg>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            isDark ? "bg-yellow-900/30" : "bg-yellow-50"
                          } px-3 py-1 rounded-full`}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              isDark ? "text-yellow-400" : "text-yellow-500"
                            }`}
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                          </svg>
                          <span
                            className={`text-sm font-semibold ${
                              isDark ? "text-yellow-400" : "text-yellow-800"
                            }`}
                          >
                            {repo.stargazers_count}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-lg font-bold ${
                          isDark
                            ? "text-white group-hover:text-purple-400"
                            : "text-slate-900 group-hover:text-purple-600"
                        } transition-colors truncate mb-2`}
                      >
                        {repo.name}
                      </h3>

                      {/* Description */}
                      <p
                        className={`${
                          isDark ? "text-slate-400" : "text-slate-600"
                        } text-sm mb-4 line-clamp-2 h-10`}
                      >
                        {repo.description || "No description provided"}
                      </p>

                      {/* Footer */}
                      <div
                        className={`flex items-center justify-between pt-4 border-t ${
                          isDark ? "border-slate-700" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {repo.language && (
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${getLanguageColor(
                                repo.language
                              )}`}
                            >
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          } text-xs`}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"
                            />
                          </svg>
                          <span>{formatDate(repo.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-20 px-6 ${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border`}
                >
                  <svg
                    className={`w-20 h-20 ${
                      isDark ? "text-slate-600" : "text-slate-300"
                    } mb-4`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p
                    className={`text-xl font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-2`}
                  >
                    No repositories found
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Try adjusting your search query
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
