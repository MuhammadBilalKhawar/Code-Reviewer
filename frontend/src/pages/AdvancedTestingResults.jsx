import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function AdvancedTestingResults() {
  const { owner, repo, testId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(null);
  const [error, setError] = useState(null);
  const [expandedIssues, setExpandedIssues] = useState({});

  // Handle navigation back to repository
  const goBackToRepo = () => {
    if (owner && repo) {
      navigate(`/repos/${owner}/${repo}`);
    } else if (testing?.owner && testing?.repo) {
      navigate(`/repos/${testing.owner}/${testing.repo}`);
    } else {
      navigate('/repositories');
    }
  };

  useEffect(() => {
    if (testId) {
      fetchTestResult();
    }
  }, [testId]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/testing/${testId}`);
      setTesting(res.data);
    } catch (err) {
      console.error("Failed to fetch test result", err);
      setError("Failed to load test results");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "text-green-500",
      A: "text-green-400",
      B: "text-blue-400",
      C: "text-yellow-400",
      D: "text-orange-400",
      F: "text-red-400",
    };
    return colors[grade] || "text-gray-400";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return isDark ? "text-green-400" : "text-green-600";
    if (score >= 60) return isDark ? "text-yellow-400" : "text-yellow-600";
    return isDark ? "text-red-400" : "text-red-600";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
      case "critical":
        return isDark ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-red-50 border-red-200 text-red-700";
      case "warning":
      case "high":
        return isDark ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "moderate":
        return isDark ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-700";
      case "low":
        return isDark ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return isDark ? "bg-slate-500/20 border-slate-500/50 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const toggleIssue = (issueId) => {
    setExpandedIssues(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };

  const IssueCard = ({ issue, idx, testType }) => {
    const uniqueId = `${testType}-${idx}`;
    const isExpanded = expandedIssues[uniqueId];

    return (
      <div className={`border rounded-lg overflow-hidden transition-all ${getSeverityColor(issue.severity)}`}>
        <button
          onClick={() => toggleIssue(uniqueId)}
          className="w-full p-4 flex items-start justify-between hover:opacity-80 transition-opacity text-left"
        >
          <div className="flex-1">
            <p className="font-semibold mb-1">{issue.message}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {issue.file && (
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                  📁 {issue.file}
                </span>
              )}
              {issue.line && (
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                  Line {issue.line}{issue.column ? `:${issue.column}` : ""}
                </span>
              )}
              {(issue.ruleId || issue.rule) && (
                <span className={`font-mono text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  {issue.ruleId || issue.rule}
                </span>
              )}
            </div>
          </div>
          <svg className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {isExpanded && (
          <div className={`border-t ${isDark ? "border-slate-600 bg-slate-900/50" : "border-slate-200 bg-slate-50"} p-4 space-y-3`}>
            {/* Issue Details */}
            {(issue.fixTitle || issue.suggestion) && (
              <div className={`p-3 rounded ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <h4 className="font-semibold text-green-500 mb-2">💡 {issue.fixTitle || "Suggested Fix"}</h4>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {issue.suggestion}
                </p>
              </div>
            )}

            {/* Additional details for different test types */}
            {issue.package && (
              <div className={`p-3 rounded ${isDark ? "bg-slate-800" : "bg-white"} space-y-1 text-sm`}>
                <p><strong>Package:</strong> <code className="font-mono">{issue.package}</code></p>
                {issue.version && <p><strong>Version:</strong> {issue.version}</p>}
                {issue.type && <p><strong>Type:</strong> {issue.type}</p>}
              </div>
            )}

            {issue.description && (
              <div className={`p-3 rounded ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {issue.description}
                </p>
              </div>
            )}

            {issue.cve && (
              <div className={`p-3 rounded ${isDark ? "bg-red-900/30 border border-red-500/30" : "bg-red-50 border border-red-200"}`}>
                <p className="text-sm font-mono"><strong>CVE:</strong> {issue.cve}</p>
              </div>
            )}

            {issue.title && !issue.message?.includes(issue.title) && (
              <div className={`p-3 rounded ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <p className="text-sm"><strong>Title:</strong> {issue.title}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render ESLint results
  const renderESLintResults = (eslint) => {
    if (!eslint || eslint.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">📝</span>
            ESLint Analysis
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {eslint?.message || "ESLint results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📝</span>
            ESLint Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(eslint.score)} mb-2`}>
                {eslint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {eslint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {eslint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className={`text-4xl font-bold ${getGradeColor(eslint.grade)}`}>
                {eslint.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Grade</p>
            </div>
          </div>
        </div>

        {/* Issue Categories */}
        {eslint.issuesByCategory && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              📊 Issues by Category
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"} border`}>
                <div className="text-3xl font-bold text-blue-500">{eslint.issuesByCategory['Code Quality']}</div>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>Code Quality</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"} border`}>
                <div className="text-3xl font-bold text-green-500">{eslint.issuesByCategory['Best Practices']}</div>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>Best Practices</p>
              </div>
            </div>
          </div>
        )}

        {/* All Errors with Details */}
        {eslint.allErrors?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔴 Errors ({eslint.allErrors.length})
            </h4>
            <div className="space-y-3">
              {eslint.allErrors.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="eslint-error" />
              ))}
            </div>
          </div>
        )}

        {/* All Warnings with Details */}
        {eslint.allWarnings?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🟡 Warnings ({eslint.allWarnings.length})
            </h4>
            <div className="space-y-3">
              {eslint.allWarnings.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="eslint-warning" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Stylelint results
  const renderStylelintResults = (stylelint) => {
    if (!stylelint || stylelint.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">🎨</span>
            Stylelint CSS Analysis
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {stylelint?.message || "Stylelint results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎨</span>
            Stylelint CSS Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(stylelint.score)} mb-2`}>
                {stylelint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {stylelint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {stylelint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className={`text-4xl font-bold ${getGradeColor(stylelint.grade)}`}>
                {stylelint.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Grade</p>
            </div>
          </div>
        </div>

        {/* Errors and Warnings */}
        {stylelint.allErrors?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔴 CSS Errors ({stylelint.allErrors.length})
            </h4>
            <div className="space-y-3">
              {stylelint.allErrors.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="stylelint-error" />
              ))}
            </div>
          </div>
        )}

        {stylelint.allWarnings?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🟡 CSS Warnings ({stylelint.allWarnings.length})
            </h4>
            <div className="space-y-3">
              {stylelint.allWarnings.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="stylelint-warning" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render HTMLHint results
  const renderHTMLHintResults = (htmlhint) => {
    if (!htmlhint || htmlhint.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">📄</span>
            HTMLHint Validation
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {htmlhint?.message || "HTMLHint results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📄</span>
            HTMLHint Validation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(htmlhint.score)} mb-2`}>
                {htmlhint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {htmlhint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {htmlhint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className={`text-4xl font-bold ${getGradeColor(htmlhint.grade)}`}>
                {htmlhint.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Grade</p>
            </div>
          </div>
        </div>

        {/* Errors and Warnings */}
        {htmlhint.allErrors?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔴 HTML Errors ({htmlhint.allErrors.length})
            </h4>
            <div className="space-y-3">
              {htmlhint.allErrors.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="htmlhint-error" />
              ))}
            </div>
          </div>
        )}

        {htmlhint.allWarnings?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🟡 HTML Warnings ({htmlhint.allWarnings.length})
            </h4>
            <div className="space-y-3">
              {htmlhint.allWarnings.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="htmlhint-warning" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Prettier results
  const renderPrettierResults = (prettier) => {
    if (!prettier || prettier.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">🎯</span>
            Prettier Format Check
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {prettier?.message || "Prettier results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎯</span>
            Prettier Format Check
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(prettier.score)} mb-2`}>
                {prettier.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {prettier.unformattedCount}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Unformatted</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className={`text-4xl font-bold ${getGradeColor(prettier.grade)}`}>
                {prettier.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Grade</p>
            </div>
          </div>
        </div>

        {/* Unformatted Files */}
        {prettier.allIssues?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              📋 Files to Format ({prettier.allIssues.length})
            </h4>
            <div className="space-y-3">
              {prettier.allIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="prettier" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Markdownlint results
  const renderMarkdownlintResults = (markdownlint) => {
    if (!markdownlint || markdownlint.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">🧾</span>
            Markdownlint
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {markdownlint?.message || "Markdownlint results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🧾</span>
            Markdownlint Documentation Checker
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(markdownlint.score)} mb-2`}>
                {markdownlint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {markdownlint.totalIssues}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Issues Found</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className={`text-4xl font-bold ${getGradeColor(markdownlint.grade)}`}>
                {markdownlint.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Grade</p>
            </div>
          </div>
        </div>

        {/* Markdown Issues */}
        {markdownlint.allIssues?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔍 Markdown Issues ({markdownlint.allIssues.length})
            </h4>
            <div className="space-y-3">
              {markdownlint.allIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="markdownlint" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render npm audit results
  const renderNpmAuditResults = (audit) => {
    if (!audit || audit.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">🛡️</span>
            npm Audit Security Check
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {audit?.message || "npm audit results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🛡️</span>
            npm Audit Security Check
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-3xl font-bold ${getScoreColor(audit.score)} mb-1`}>
                {audit.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className="text-3xl font-bold text-red-500">{audit.vulnerabilities?.critical || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Critical</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10">
              <div className="text-3xl font-bold text-orange-500">{audit.vulnerabilities?.high || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>High</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className="text-3xl font-bold text-yellow-500">{audit.vulnerabilities?.moderate || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Moderate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <div className="text-3xl font-bold text-blue-500">{audit.vulnerabilities?.low || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Low</p>
            </div>
          </div>
        </div>

        {/* Vulnerabilities */}
        {audit.vulnerabilityList?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔓 Vulnerabilities ({audit.vulnerabilityList.length})
            </h4>
            <div className="space-y-3">
              {audit.vulnerabilityList.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="npm-audit" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render depcheck results
  const renderDepcheckResults = (depcheck) => {
    if (!depcheck || depcheck.status === "ERROR") {
      return (
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
            <span className="text-2xl">📦</span>
            Dependency Check
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            {depcheck?.message || "Depcheck results are not available for this repository."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📦</span>
            Dependency Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-4xl font-bold ${getScoreColor(depcheck.score)} mb-2`}>
                {depcheck.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {depcheck.unusedDependencies?.length || 0}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Unused Deps</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                {depcheck.unusedDevDependencies?.length || 0}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Unused DevDeps</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {depcheck.missingDependencies?.length || 0}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Missing Deps</p>
            </div>
          </div>
        </div>

        {/* Unused Dependencies */}
        {depcheck.unusedDependencies?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              ⚠️ Unused Dependencies ({depcheck.unusedDependencies.length})
            </h4>
            <div className="space-y-3">
              {depcheck.unusedDependencies.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="depcheck-unused" />
              ))}
            </div>
          </div>
        )}

        {/* Unused Dev Dependencies */}
        {depcheck.unusedDevDependencies?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              ℹ️ Unused Dev Dependencies ({depcheck.unusedDevDependencies.length})
            </h4>
            <div className="space-y-3">
              {depcheck.unusedDevDependencies.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="depcheck-devunused" />
              ))}
            </div>
          </div>
        )}

        {/* Missing Dependencies */}
        {depcheck.missingDependencies?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              ❌ Missing Dependencies ({depcheck.missingDependencies.length})
            </h4>
            <div className="space-y-3">
              {depcheck.missingDependencies.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} idx={idx} testType="depcheck-missing" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render ALL available test results
  const renderResults = () => {
    const renderedResults = [];
    
    // Check and render each test type that has results
    if (results.eslint) {
      renderedResults.push(
        <div key="eslint" className="mb-8">
          {renderESLintResults(results.eslint)}
        </div>
      );
    }
    
    if (results.stylelint) {
      renderedResults.push(
        <div key="stylelint" className="mb-8">
          {renderStylelintResults(results.stylelint)}
        </div>
      );
    }
    
    if (results.htmlhint) {
      renderedResults.push(
        <div key="htmlhint" className="mb-8">
          {renderHTMLHintResults(results.htmlhint)}
        </div>
      );
    }
    
    if (results.prettier) {
      renderedResults.push(
        <div key="prettier" className="mb-8">
          {renderPrettierResults(results.prettier)}
        </div>
      );
    }
    
    if (results.markdownlint) {
      renderedResults.push(
        <div key="markdownlint" className="mb-8">
          {renderMarkdownlintResults(results.markdownlint)}
        </div>
      );
    }
    
    if (results["npm-audit"]) {
      renderedResults.push(
        <div key="npm-audit" className="mb-8">
          {renderNpmAuditResults(results["npm-audit"])}
        </div>
      );
    }
    
    if (results.depcheck) {
      renderedResults.push(
        <div key="depcheck" className="mb-8">
          {renderDepcheckResults(results.depcheck)}
        </div>
      );
    }
    
    // If no results found, show message
    if (renderedResults.length === 0) {
      return (
        <div className="text-center py-8">
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            No results available for this test type
          </p>
        </div>
      );
    }
    
    return <>{renderedResults}</>;
  };

  if (loading) {
    return (
      <Layout>
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${isDark ? "text-slate-300" : "text-slate-700"} text-lg`}>
              Loading test results...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !testing) {
    return (
      <Layout>
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} flex items-center justify-center`}>
          <div className="text-center">
            <p className={`${isDark ? "text-red-400" : "text-red-600"} text-xl mb-4`}>
              {error || "Test results not found"}
            </p>
            <button
              onClick={goBackToRepo}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Repository
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const results = testing?.results || {};

  return (
    <Layout>
      <div className={`min-h-screen p-8 ${isDark ? "bg-slate-900" : "bg-slate-50"} transition-colors`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={goBackToRepo}
              className={`flex items-center gap-2 ${
                isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
              } font-semibold mb-4`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Repository
            </button>
            <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>
              Advanced Testing Report
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {owner}/{repo}
            </p>
            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"} mt-1`}>
              Tested on {new Date(testing.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Overall Score Card */}
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-8 mb-8 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>
                  Overall Score
                </h2>
                <div className="flex items-baseline gap-4">
                  <span className={`text-6xl font-bold ${getScoreColor(testing.overallScore)}`}>
                    {testing.overallScore}
                  </span>
                  <span className={`text-4xl font-bold ${getGradeColor(testing.grade)}`}>
                    {testing.grade}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  testing.overallScore >= 80 ? "bg-green-500/20 text-green-400" :
                  testing.overallScore >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {testing.overallScore >= 80 ? "Excellent ✨" : testing.overallScore >= 60 ? "Good 👍" : "Needs Improvement 📈"}
                </div>
                <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"} mt-2`}>
                  Tests Run: {testing.testType}
                </p>
              </div>
            </div>
          </div>

          {/* Test-specific results */}
          {renderResults()}
        </div>
      </div>
    </Layout>
  );
}
