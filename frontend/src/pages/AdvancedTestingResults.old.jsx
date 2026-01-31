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
              onClick={() => navigate(`/repos/${owner}/${repo}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Repository
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { results } = testing;

  // Render Codacy results
  const renderCodacyResults = (codacy) => {
    if (!codacy || codacy.status === "ERROR" || !codacy.analysis) {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">🎨</span>
              Codacy Quality Analysis
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {codacy?.message || "Codacy results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 mt-8">
        {/* Quality Grade Card */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎨</span>
            Codacy Quality Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className={`text-5xl font-bold ${getGradeColor(codacy.analysis.grade)} mb-2`}>
                {codacy.analysis.grade}
              </div>
              <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Quality Grade</p>
            </div>
            
            {codacy.analysis.coverage && (
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                <div className={`text-5xl font-bold ${getScoreColor(codacy.analysis.coverage.percentage)}`}>
                  {codacy.analysis.coverage.percentage}%
                </div>
                <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Code Coverage</p>
              </div>
            )}
            
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <div className={`text-5xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                {codacy.analysis.issues.total}
              </div>
              <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Total Issues</p>
            </div>
          </div>

          {/* Issues Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"} border ${isDark ? "border-red-500/30" : "border-red-200"}`}>
              <div className="text-3xl font-bold text-red-500">{codacy.analysis.issues.error}</div>
              <div className={`text-sm font-semibold ${isDark ? "text-red-400" : "text-red-700"}`}>Errors</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-yellow-500/10" : "bg-yellow-50"} border ${isDark ? "border-yellow-500/30" : "border-yellow-200"}`}>
              <div className="text-3xl font-bold text-yellow-500">{codacy.analysis.issues.warning}</div>
              <div className={`text-sm font-semibold ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>Warnings</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}>
              <div className="text-3xl font-bold text-blue-500">{codacy.analysis.issues.info}</div>
              <div className={`text-sm font-semibold ${isDark ? "text-blue-400" : "text-blue-700"}`}>Info</div>
            </div>
          </div>

          {codacy.metadata?.dashboard_url && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <a
                href={codacy.metadata.dashboard_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600 font-semibold"
              >
                View Full Report on Codacy →
              </a>
            </div>
          )}
        </div>

        {/* Critical Issues */}
        {codacy.issues?.critical?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🔴 Critical Issues ({codacy.issues.critical.length})
            </h3>
            <div className="space-y-3">
              {codacy.issues.critical.slice(0, 10).map((issue, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"} border ${isDark ? "border-red-500/30" : "border-red-200"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? "text-red-400" : "text-red-700"} mb-1`}>{issue.message}</p>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} font-mono`}>
                        📁 {issue.file}:{issue.line}
                      </p>
                      {issue.category && (
                        <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${isDark ? "bg-slate-700" : "bg-slate-200"} ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {issue.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {codacy.issues.critical.length > 10 && (
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mt-4`}>
                And {codacy.issues.critical.length - 10} more issues...
              </p>
            )}
          </div>
        )}

        {/* Major Issues */}
        {codacy.issues?.major?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              🟡 Major Issues ({codacy.issues.major.length})
            </h3>
            <div className="space-y-3">
              {codacy.issues.major.slice(0, 5).map((issue, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${isDark ? "bg-yellow-500/10" : "bg-yellow-50"} border ${isDark ? "border-yellow-500/30" : "border-yellow-200"}`}>
                  <p className={`font-semibold ${isDark ? "text-yellow-400" : "text-yellow-700"} mb-1`}>{issue.message}</p>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} font-mono`}>
                    📁 {issue.file}:{issue.line}
                  </p>
                </div>
              ))}
            </div>
            {codacy.issues.major.length > 5 && (
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mt-4`}>
                And {codacy.issues.major.length - 5} more issues...
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render GitHub Code Scanning results
  const renderGitHubCodeScanningResults = (scanning) => {
    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🔒</span>
            GitHub Code Scanning Results
          </h3>
          <p className={`${isDark ? "text-slate-300" : "text-slate-700"} mb-4`}>
            Security analysis powered by CodeQL
          </p>
          {/* Add GitHub scanning specific rendering */}
          <div className="text-center py-8">
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Detailed GitHub Code Scanning UI coming soon...
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render SonarCloud results
  const renderSonarCloudResults = (sonar) => {
    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📊</span>
            SonarCloud Analysis Results
          </h3>
          <p className={`${isDark ? "text-slate-300" : "text-slate-700"} mb-4`}>
            Comprehensive code quality metrics
          </p>
          {/* Add SonarCloud specific rendering */}
          <div className="text-center py-8">
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Detailed SonarCloud UI coming soon...
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render ESLint results
  const renderESLintResults = (eslint) => {
    if (!eslint || eslint.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">📝</span>
              ESLint Analysis
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {eslint?.message || "ESLint results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📝</span>
            ESLint Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(eslint.score)} mb-2`}>
                {eslint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {eslint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {eslint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}>
              <div className="text-2xl font-bold text-blue-500">{eslint.issuesByCategory['Code Quality']}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Code Quality Issues</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-green-500/10" : "bg-green-50"} border ${isDark ? "border-green-500/30" : "border-green-200"}`}>
              <div className="text-2xl font-bold text-green-500">{eslint.issuesByCategory['Best Practices']}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Best Practice Issues</div>
            </div>
          </div>

          {eslint.topIssues?.length > 0 && (
            <div>
              <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-3`}>
                Top Issues ({eslint.topIssues.length})
              </h4>
              <div className="space-y-2">
                {eslint.topIssues.slice(0, 10).map((issue, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDark ? "bg-slate-700/50" : "bg-slate-100"} border ${isDark ? "border-slate-600" : "border-slate-200"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'} mb-1`}>
                          {issue.message}
                        </p>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {issue.file}:{issue.line}:{issue.column}
                        </p>
                        {issue.ruleId && (
                          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            Rule: {issue.ruleId}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        issue.severity === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Stylelint results
  const renderStylelintResults = (stylelint) => {
    if (!stylelint || stylelint.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">🎨</span>
              Stylelint CSS Analysis
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {stylelint?.message || "Stylelint results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎨</span>
            Stylelint CSS Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(stylelint.score)} mb-2`}>
                {stylelint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {stylelint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {stylelint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
          </div>

          <p className={`text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Analyzed {stylelint.filesAnalyzed} CSS/SCSS files
          </p>
        </div>
      </div>
    );
  };

  // Render HTMLHint results
  const renderHTMLHintResults = (htmlhint) => {
    if (!htmlhint || htmlhint.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">📄</span>
              HTMLHint Validation
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {htmlhint?.message || "HTMLHint results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📄</span>
            HTMLHint Validation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(htmlhint.score)} mb-2`}>
                {htmlhint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {htmlhint.totalErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Errors</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {htmlhint.totalWarnings}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Warnings</p>
            </div>
          </div>

          <p className={`text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Analyzed {htmlhint.filesAnalyzed} HTML files
          </p>
        </div>
      </div>
    );
  };

  // Render Prettier results
  const renderPrettierResults = (prettier) => {
    if (!prettier || prettier.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">🎯</span>
              Prettier Format Check
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {prettier?.message || "Prettier results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎯</span>
            Prettier Format Check
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(prettier.score)} mb-2`}>
                {prettier.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {prettier.unformattedCount}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Unformatted Files</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {prettier.parseErrors}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Parse Errors</p>
            </div>
          </div>

          {prettier.unformattedFiles?.length > 0 && (
            <div>
              <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-3`}>
                Unformatted Files
              </h4>
              <ul className="space-y-2">
                {prettier.unformattedFiles.slice(0, 10).map((file, idx) => (
                  <li key={idx} className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {file.file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Markdownlint results
  const renderMarkdownlintResults = (markdownlint) => {
    if (!markdownlint || markdownlint.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">🧾</span>
              Markdownlint
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {markdownlint?.message || "Markdownlint results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🧾</span>
            Markdownlint
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(markdownlint.score)} mb-2`}>
                {markdownlint.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {markdownlint.totalIssues}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Issues</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render npm audit results
  const renderNpmAuditResults = (audit) => {
    if (!audit || audit.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">🛡️</span>
              npm Audit
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {audit?.message || "npm audit results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🛡️</span>
            npm Audit
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(audit.score)} mb-1`}>
                {audit.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{audit.vulnerabilities?.critical || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Critical</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{audit.vulnerabilities?.high || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>High</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{audit.vulnerabilities?.moderate || 0}</div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Moderate</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render depcheck results
  const renderDepcheckResults = (depcheck) => {
    if (!depcheck || depcheck.status === "ERROR") {
      return (
        <div className="space-y-6 mt-8">
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2 flex items-center gap-2`}>
              <span className="text-2xl">📦</span>
              Depcheck
            </h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              {depcheck?.message || "Depcheck results are not available for this repository."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 mt-8">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📦</span>
            Depcheck
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(depcheck.score)} mb-2`}>
                {depcheck.score}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Score</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                {depcheck.unusedDependencies?.length || 0}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Unused Deps</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {depcheck.missingDependencies?.length || 0}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Missing Deps</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine which test type to render
  const renderResults = () => {
    // Check for ESLint results
    if (results.eslint) {
      return renderESLintResults(results.eslint);
    }
    // Check for Stylelint results
    if (results.stylelint) {
      return renderStylelintResults(results.stylelint);
    }
    // Check for HTMLHint results
    if (results.htmlhint) {
      return renderHTMLHintResults(results.htmlhint);
    }
    // Check for Prettier results
    if (results.prettier) {
      return renderPrettierResults(results.prettier);
    }
    // Check for Markdownlint results
    if (results.markdownlint) {
      return renderMarkdownlintResults(results.markdownlint);
    }
    // Check for npm audit results
    if (results["npm-audit"]) {
      return renderNpmAuditResults(results["npm-audit"]);
    }
    // Check for depcheck results
    if (results.depcheck) {
      return renderDepcheckResults(results.depcheck);
    }
    return (
      <div className="text-center py-8">
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          No results available for this test type
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <div className={`min-h-screen p-8 ${isDark ? "bg-slate-900" : "bg-slate-50"} transition-colors`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/repos/${owner}/${repo}`)}
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
            <div className="flex items-center justify-between">
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
                  Test Type: {testing.testType}
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
