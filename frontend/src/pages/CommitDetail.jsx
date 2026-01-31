import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function CommitDetail() {
  const { owner, repo, sha } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [files, setFiles] = useState([]);
  const [commitData, setCommitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewHistory, setReviewHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filesRes, token] = [
          await api.get(
            `/api/github/repos/${owner}/${repo}/commits/${sha}/files`
          ),
          localStorage.getItem("token"),
        ];
        setFiles(filesRes.data || []);

        // Fetch review history for this commit
        const historyRes = await api.get(
          `/api/reviews?owner=${owner}&repo=${repo}&commitSha=${sha}`
        );
        setReviewHistory(historyRes.data || []);

        // Extract commit message from file response (we'll get it another way)
        // For now, we'll display what we have
        setCommitData({ message: `Commit ${sha.substring(0, 7)}` });
      } catch (err) {
        console.error("Failed to fetch commit data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, repo, sha]);

  const runAiReview = async () => {
    setReviewLoading(true);
    setError("");
    try {
      const res = await api.post(`/api/reviews/commit`, {
        owner,
        repo,
        sha,
        files,
      });
      const review = res.data;
      if (review && review._id) {
        navigate(`/reviews/${review._id}`);
      }
    } catch (err) {
      console.error("Failed to run AI review", err);
      setError(err.response?.data?.message || "Failed to run AI review");
    } finally {
      setReviewLoading(false);
    }
  };

  const totalAdditions = files.reduce((acc, f) => acc + (f.additions || 0), 0);
  const totalDeletions = files.reduce((acc, f) => acc + (f.deletions || 0), 0);

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
              onClick={() => navigate(`/repos/${owner}/${repo}`)}
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
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-4xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  } mb-2`}
                >
                  Commit {sha.substring(0, 7)}
                </h1>
                <p
                  className={`${
                    isDark ? "text-slate-400" : "text-slate-600"
                  } text-lg`}
                >
                  {owner}/{repo}
                </p>
              </div>
              <button
                onClick={runAiReview}
                disabled={reviewLoading}
                className="bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {reviewLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Run AI Review"
                )}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className={`mb-8 ${
                isDark
                  ? "bg-red-900/30 border-red-700"
                  : "bg-red-50 border-red-200"
              } border rounded-xl p-4 flex items-start gap-3`}
            >
              <svg
                className={`w-6 h-6 ${
                  isDark ? "text-red-400" : "text-red-600"
                } shrink-0 mt-0.5`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <div>
                <p
                  className={`font-semibold ${
                    isDark ? "text-red-300" : "text-red-900"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p
                className={`${
                  isDark ? "text-slate-400" : "text-slate-600"
                } text-lg font-medium`}
              >
                Loading files...
              </p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-6 mb-10 animate-stagger">
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border shadow-sm p-6 animate-fade-in-up hover-lift`}
                >
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm font-medium mb-2`}
                  >
                    Files Changed
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {files.length}
                  </p>
                </div>
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border shadow-sm p-6 animate-fade-in-up hover-lift`}
                >
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm font-medium mb-2`}
                  >
                    Additions
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    +{totalAdditions}
                  </p>
                </div>
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border shadow-sm p-6 animate-fade-in-up hover-lift`}
                >
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm font-medium mb-2`}
                  >
                    Deletions
                  </p>
                  <p className="text-4xl font-bold text-red-600">
                    -{totalDeletions}
                  </p>
                </div>
              </div>

              {/* Files List */}
              <div
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm overflow-hidden animate-fade-in-up`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark
                      ? "border-slate-700 bg-linear-to-r from-slate-800 to-slate-700"
                      : "border-slate-200 bg-linear-to-r from-green-50 to-green-100"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Files Changed
                  </h2>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm mt-1`}
                  >
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div
                  className={`divide-y ${
                    isDark ? "divide-slate-700" : "divide-slate-200"
                  } max-h-96 overflow-y-auto`}
                >
                  {files.length > 0 ? (
                    files.map((f) => (
                      <div
                        key={f.sha + f.filename}
                        className={`p-6 ${
                          isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        } transition-colors flex items-center justify-between`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                f.status === "added"
                                  ? isDark
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-green-100 text-green-800"
                                  : f.status === "removed"
                                  ? isDark
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-red-100 text-red-800"
                                  : f.status === "renamed"
                                  ? isDark
                                    ? "bg-blue-900/30 text-blue-400"
                                    : "bg-blue-100 text-blue-800"
                                  : isDark
                                  ? "bg-slate-700 text-slate-400"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {f.status?.toUpperCase()}
                            </span>
                            <p
                              className={`font-mono ${
                                isDark ? "text-white" : "text-slate-900"
                              } truncate`}
                            >
                              {f.filename}
                            </p>
                          </div>
                          <p
                            className={`text-sm font-mono ${
                              isDark ? "text-slate-500" : "text-slate-500"
                            }`}
                          >
                            {f.filename.split("/").pop()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 ml-6 shrink-0">
                          <span className="text-green-600 font-semibold">
                            +{f.additions || 0}
                          </span>
                          <span className="text-red-600 font-semibold">
                            -{f.deletions || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`p-12 text-center ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <p>No files changed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review History */}
              <div
                className={`mt-10 ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm overflow-hidden animate-fade-in-up`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark
                      ? "border-slate-700 bg-linear-to-r from-slate-800 to-slate-700"
                      : "border-slate-200 bg-linear-to-r from-blue-50 to-blue-100"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Review History
                  </h2>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm mt-1`}
                  >
                    Previous reviews for this commit
                  </p>
                </div>

                {reviewHistory.length > 0 ? (
                  <div
                    className={`divide-y ${
                      isDark ? "divide-slate-700" : "divide-slate-200"
                    } animate-stagger`}
                  >
                    {reviewHistory.map((review) => (
                      <div
                        key={review._id}
                        className={`p-6 ${
                          isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        } transition-colors cursor-pointer hover-lift animate-fade-in-up`}
                        onClick={() => navigate(`/reviews/${review._id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {review.summary}
                            </p>
                            <p
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              } mt-1`}
                            >
                              Reviewed on{" "}
                              {new Date(review.createdAt).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(review.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                          <span
                            className={`${
                              isDark ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg
                      className={`w-12 h-12 ${
                        isDark ? "text-slate-600" : "text-slate-300"
                      } mx-auto mb-3`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                    <p
                      className={`${
                        isDark ? "text-slate-300" : "text-slate-600"
                      } font-medium`}
                    >
                      No previous reviews
                    </p>
                    <p
                      className={`${
                        isDark ? "text-slate-400" : "text-slate-500"
                      } text-sm mt-1`}
                    >
                      Start by running an AI review above
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
