import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function RepositoryDetail() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [pulls, setPulls] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prRes, commitsRes] = await Promise.all([
          api.get(`/api/github/repos/${owner}/${repo}/pull-requests`),
          api.get(`/api/github/repos/${owner}/${repo}/commits`),
        ]);
        setPulls(prRes.data || []);
        setCommits(commitsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch repo details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, repo]);

  const goPRDetail = (number) => {
    navigate(`/repos/${owner}/${repo}/pull/${number}`);
  };

  const goCommitDetail = (sha) => {
    navigate(`/repos/${owner}/${repo}/commit/${sha}`);
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
          <div className="mb-10 animate-fade-in-down">
            <button
              onClick={() => navigate("/repositories")}
              className={`flex items-center gap-2 ${
                isDark
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              } font-semibold mb-4 transition-colors`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 12H5m7-7l-7 7 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Back to Repositories
            </button>
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              {repo}
            </h1>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Review and analyze pull requests & commits
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p
                className={`${
                  isDark ? "text-slate-400" : "text-slate-600"
                } text-lg font-medium`}
              >
                Loading pull requests & commits...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-stagger">
              {/* Pull Requests Section */}
              <section
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm overflow-hidden animate-fade-in-up hover-lift`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark
                      ? "border-slate-700 bg-linear-to-r from-blue-900/30 to-blue-900/50"
                      : "border-slate-200 bg-linear-to-r from-blue-50 to-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg
                      className={`w-6 h-6 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <h2
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Pull Requests
                    </h2>
                  </div>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    {pulls.length} pull request{pulls.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div
                  className={`divide-y ${
                    isDark ? "divide-slate-700" : "divide-slate-200"
                  } max-h-96 overflow-y-auto`}
                >
                  {pulls.length > 0 ? (
                    pulls.map((pr) => (
                      <div
                        key={pr.id}
                        className={`p-6 ${
                          isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        } transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-sm font-mono ${
                                  isDark
                                    ? "text-slate-400 bg-slate-700"
                                    : "text-slate-600 bg-slate-100"
                                } px-2 py-1 rounded`}
                              >
                                #{pr.number}
                              </span>
                              <h3
                                className={`font-semibold ${
                                  isDark ? "text-white" : "text-slate-900"
                                } line-clamp-2`}
                              >
                                {pr.title}
                              </h3>
                            </div>
                            <div
                              className={`flex items-center gap-3 text-sm ${
                                isDark ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              <span>{pr.user?.login}</span>
                              <span>•</span>
                              <span>
                                {new Date(pr.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              pr.state === "open"
                                ? isDark
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-green-100 text-green-800"
                                : isDark
                                ? "bg-purple-900/30 text-purple-400"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {pr.state === "open" ? "Open" : "Merged"}
                          </span>
                        </div>
                        <button
                          onClick={() => goPRDetail(pr.number)}
                          className={`w-full ${
                            isDark
                              ? "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                              : "bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-lg"
                          } text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover-lift`}
                        >
                          Run AI Review
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`p-12 text-center ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <p>No pull requests</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Commits Section */}
              <section
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm overflow-hidden animate-fade-in-up hover-lift`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark
                      ? "border-slate-700 bg-linear-to-r from-green-900/30 to-green-900/50"
                      : "border-slate-200 bg-linear-to-r from-green-50 to-green-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg
                      className={`w-6 h-6 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <h2
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Recent Commits
                    </h2>
                  </div>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    {Math.min(commits.length, 10)} recent commit
                    {Math.min(commits.length, 10) !== 1 ? "s" : ""}
                  </p>
                </div>

                <div
                  className={`divide-y ${
                    isDark ? "divide-slate-700" : "divide-slate-200"
                  } max-h-96 overflow-y-auto`}
                >
                  {commits.length > 0 ? (
                    commits.slice(0, 10).map((c) => (
                      <div
                        key={c.sha}
                        className={`p-6 ${
                          isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        } transition-colors`}
                      >
                        <div className="mb-4">
                          <h3
                            className={`font-semibold ${
                              isDark ? "text-white" : "text-slate-900"
                            } line-clamp-2 mb-2`}
                          >
                            {c.commit?.message}
                          </h3>
                          <div
                            className={`flex items-center gap-3 text-sm ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            <span>{c.commit?.author?.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                c.commit?.author?.date
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={`font-mono text-xs ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              ({c.sha.substring(0, 7)})
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => goCommitDetail(c.sha)}
                          className={`w-full ${
                            isDark
                              ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                              : "bg-linear-to-r from-green-600 to-green-700 hover:shadow-lg"
                          } text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover-lift`}
                        >
                          Run AI Review
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`p-12 text-center ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <p>No commits</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
