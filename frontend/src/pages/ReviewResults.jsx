import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function ReviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/api/reviews/${id}`);
        setReview(res.data);
      } catch (err) {
        console.error("Failed to fetch review", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const issues = review?.issues || [];
  const totals = issues.reduce(
    (acc, i) => {
      acc.total += 1;
      acc[i.severity || "low"] = (acc[i.severity || "low"] || 0) + 1;
      return acc;
    },
    { total: 0, high: 0, medium: 0, low: 0 }
  );

  const filteredIssues = issues.filter((i) =>
    filter === "all" ? true : (i.severity || "low").toLowerCase() === filter
  );

  const issuesByFile = filteredIssues.reduce((acc, issue) => {
    const file = issue.file || "Unknown file";
    if (!acc[file]) acc[file] = [];
    acc[file].push(issue);
    return acc;
  }, {});

  const getSeverityColor = (severity) => {
    switch ((severity || "low").toLowerCase()) {
      case "high":
        return isDark ? "text-red-400" : "text-red-700";
      case "medium":
        return isDark ? "text-amber-400" : "text-amber-700";
      case "low":
        return isDark ? "text-blue-400" : "text-blue-700";
      default:
        return isDark ? "text-slate-400" : "text-slate-700";
    }
  };

  const getSeverityBg = (severity) => {
    switch ((severity || "low").toLowerCase()) {
      case "high":
        return isDark
          ? "bg-red-900/20 border-red-700"
          : "bg-red-50 border-red-200";
      case "medium":
        return isDark
          ? "bg-amber-900/20 border-amber-700"
          : "bg-amber-50 border-amber-200";
      case "low":
        return isDark
          ? "bg-blue-900/20 border-blue-700"
          : "bg-blue-50 border-blue-200";
      default:
        return isDark
          ? "bg-slate-800/30 border-slate-700"
          : "bg-slate-50 border-slate-200";
    }
  };

  const getSeverityBadgeBg = (severity) => {
    switch ((severity || "low").toLowerCase()) {
      case "high":
        return isDark
          ? "bg-red-900/40 text-red-400"
          : "bg-red-100 text-red-700";
      case "medium":
        return isDark
          ? "bg-amber-900/40 text-amber-400"
          : "bg-amber-100 text-amber-700";
      case "low":
        return isDark
          ? "bg-blue-900/40 text-blue-400"
          : "bg-blue-100 text-blue-700";
      default:
        return isDark
          ? "bg-slate-700 text-slate-300"
          : "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Layout>
      <div
        className={`p-8 max-w-6xl mx-auto ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        } min-h-screen transition-colors`}
      >
        {/* Header with Back Button */}
        <div className="mb-8 animate-fade-in-down">
          <button
            onClick={() => navigate(-1)}
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
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <h1
            className={`text-4xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            } mb-2`}
          >
            Review Results
          </h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            AI Code Analysis Complete
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Loading review...
            </p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div
              className={`${
                isDark
                  ? "bg-linear-to-r from-slate-800 to-slate-700 border-slate-600"
                  : "bg-linear-to-r from-green-50 to-emerald-50 border-green-200"
              } border rounded-xl p-8 mb-8 shadow-sm animate-scale-in hover-lift`}
            >
              <div className="flex items-start justify-between mb-6">
                <h2
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Analysis Summary
                </h2>
                <div
                  className={`flex items-center gap-2 ${
                    isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-green-100 text-green-700"
                  } px-4 py-2 rounded-full text-sm font-semibold`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Complete
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-1`}
                  >
                    {totals.total}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    Total Issues
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600 mb-1">
                    {totals.high}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    High
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600 mb-1">
                    {totals.medium}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    Medium
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {totals.low}
                  </p>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } text-sm`}
                  >
                    Low
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            {totals.total > 0 && (
              <div
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } border rounded-xl p-4 mb-8 flex items-center gap-3 shadow-sm animate-fade-in-up`}
              >
                <svg
                  className={`w-5 h-5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  } shrink-0`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 4c0-1.1.9-2 2-2h14a2 2 0 012 2v2c0 1-3 5.71-8 9.5S3 15 3 14V4z" />
                </svg>
                <span
                  className={`font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  } shrink-0`}
                >
                  Filter:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    ["all", "All", totals.total],
                    ["high", "High", totals.high],
                    ["medium", "Medium", totals.medium],
                    ["low", "Low", totals.low],
                  ].map(([value, label, count]) => (
                    <button
                      key={value}
                      onClick={() => setFilter(value)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all hover-scale ${
                        filter === value
                          ? "bg-purple-600 text-white shadow-md"
                          : isDark
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
              <div
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } border rounded-xl p-16 text-center shadow-sm`}
              >
                <svg
                  className={`w-20 h-20 ${
                    isDark ? "text-slate-600" : "text-green-400"
                  } mx-auto mb-4`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h3
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  } mb-2`}
                >
                  No Issues Found
                </h3>
                <p
                  className={`${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Great code! No issues detected for this severity level.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-stagger">
                {Object.entries(issuesByFile).map(([file, fileIssues]) => (
                  <div
                    key={file}
                    className={`border rounded-xl overflow-hidden shadow-sm ${getSeverityBg(
                      fileIssues[0]?.severity
                    )} ${
                      isDark ? "bg-slate-800/40" : "bg-white"
                    } animate-fade-in-up hover-lift`}
                  >
                    <div
                      className={`${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-slate-200"
                      } border-b p-4 flex items-center gap-3`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      </svg>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          } font-mono text-sm`}
                        >
                          {file}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {fileIssues.length} issue
                          {fileIssues.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {fileIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`${
                            isDark
                              ? "bg-slate-700/50 border-slate-600"
                              : "bg-white border-slate-200"
                          } border rounded-lg p-4`}
                        >
                          <div className="flex items-start gap-3 mb-3 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded font-bold text-xs ${getSeverityBadgeBg(
                                issue.severity
                              )}`}
                            >
                              {(issue.severity || "low").toUpperCase()}
                            </span>
                            <span
                              className={`text-sm ${
                                isDark ? "text-slate-300" : "text-slate-600"
                              } font-medium`}
                            >
                              {issue.type || "issue"}
                            </span>
                            {issue.line && (
                              <span
                                className={`ml-auto text-sm ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                } font-mono`}
                              >
                                Line {issue.line}
                              </span>
                            )}
                          </div>
                          <p
                            className={`${
                              isDark ? "text-white" : "text-slate-900"
                            } font-semibold mb-2 leading-relaxed`}
                          >
                            {issue.message || "No description"}
                          </p>
                          {issue.suggestion && (
                            <div
                              className={`${
                                isDark
                                  ? "bg-blue-900/30 border-blue-700"
                                  : "bg-blue-50 border-blue-500"
                              } border-l-4 p-3 rounded`}
                            >
                              <p className="text-sm">
                                <span
                                  className={`font-semibold ${
                                    isDark ? "text-blue-400" : "text-blue-700"
                                  }`}
                                >
                                  Suggestion:
                                </span>
                                <span
                                  className={`${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                  } ml-2`}
                                >
                                  {issue.suggestion}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
