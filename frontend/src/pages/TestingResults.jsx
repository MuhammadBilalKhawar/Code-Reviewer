import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function TestingResults() {
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

  // Helper Functions
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

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return colors[severity] || colors.low;
  };

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div
          className={`min-h-screen ${
            isDark ? "bg-slate-900" : "bg-slate-50"
          } flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p
              className={`${
                isDark ? "text-slate-300" : "text-slate-700"
              } text-lg`}
            >
              Loading test results...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error State
  if (error || !testing) {
    return (
      <Layout>
        <div
          className={`min-h-screen ${
            isDark ? "bg-slate-900" : "bg-slate-50"
          } flex items-center justify-center`}
        >
          <div className="text-center">
            <p
              className={`${
                isDark ? "text-red-400" : "text-red-600"
              } text-xl mb-4`}
            >
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

  // Render Functions
  const renderCodacyResults = (codacy) => {
    return (
      <div className="space-y-6">
        {/* Quality Grade Card */}
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🎨</span>
            Codacy Quality Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getGradeColor(codacy.analysis.grade)} mb-2`}>
                {codacy.analysis.grade}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Quality Grade</p>
            </div>
            
            {codacy.analysis.coverage && (
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(codacy.analysis.coverage.percentage)}`}>
                  {codacy.analysis.coverage.percentage}%
                </div>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>Code Coverage</p>
              </div>
            )}
            
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                {codacy.analysis.issues.total}
              </div>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>Total Issues</p>
            </div>
          </div>

          {/* Issues Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className={`p-4 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"} border ${isDark ? "border-red-500/30" : "border-red-200"}`}>
              <div className="text-2xl font-bold text-red-500">{codacy.analysis.issues.error}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Errors</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-yellow-500/10" : "bg-yellow-50"} border ${isDark ? "border-yellow-500/30" : "border-yellow-200"}`}>
              <div className="text-2xl font-bold text-yellow-500">{codacy.analysis.issues.warning}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Warnings</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}>
              <div className="text-2xl font-bold text-blue-500">{codacy.analysis.issues.info}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Info</div>
            </div>
          </div>

          {codacy.metadata?.dashboard_url && (
            <div className="mt-4">
              <a
                href={codacy.metadata.dashboard_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600 font-semibold"
              >
                View on Codacy →
              </a>
            </div>
          )}
        </div>

        {/* Critical Issues */}
        {codacy.issues?.critical?.length > 0 && (
          <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>
              Critical Issues ({codacy.issues.critical.length})
            </h3>
            <div className="space-y-3">
              {codacy.issues.critical.slice(0, 10).map((issue, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"} border ${isDark ? "border-red-500/30" : "border-red-200"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? "text-red-400" : "text-red-700"} mb-1`}>{issue.message}</p>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{issue.file}:{issue.line}</p>
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
          </div>
        )}
      </div>
    );
  };

  const renderGitHubCodeScanningResults = (scanning) => {
    return (
      <div className="space-y-6">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">🔒</span>
            GitHub Code Scanning Results
          </h3>
          <p className={isDark ? "text-slate-300" : "text-slate-700"}>
            Security analysis powered by CodeQL
          </p>
        </div>
      </div>
    );
  };

  const renderSonarCloudResults = (sonar) => {
    return (
      <div className="space-y-6">
        <div className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-6 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">📊</span>
            SonarCloud Analysis Results
          </h3>
          <p className={isDark ? "text-slate-300" : "text-slate-700"}>
            Comprehensive code quality metrics
          </p>
        </div>
      </div>
    );
  };

  const renderCustomResults = () => {
    return (
      <>
        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(results.codeQuality.score)}`}>
              {results.codeQuality.score}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Code Quality
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(results.security.score)}`}>
              {results.security.score}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Security
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(results.testReadiness.score)}`}>
              {results.testReadiness.score}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Test Readiness
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(results.performance.score)}`}>
              {results.performance.score}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Performance
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(results.aiAnalysis.score)}`}>
              {results.aiAnalysis.score}
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              AI Analysis
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid with 4 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Code Quality Card */}
          <div
            className={`${
              isDark ? "bg-slate-800" : "bg-white"
            } rounded-xl shadow-lg p-6 border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-4 flex items-center gap-2`}
            >
              <span className="text-2xl">📊</span>
              Code Quality
            </h3>
            
            <div className="mb-4">
              <div className={`text-3xl font-bold ${getScoreColor(results.codeQuality.score)} mb-2`}>
                {results.codeQuality.score}/100
              </div>
              
              {results.codeQuality.metrics && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{results.codeQuality.metrics.hasReadme ? "✅" : "❌"}</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>README.md</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{results.codeQuality.metrics.hasGitignore ? "✅" : "❌"}</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>.gitignore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{results.codeQuality.metrics.hasLicense ? "✅" : "❌"}</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>LICENSE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{results.codeQuality.metrics.hasCI ? "✅" : "❌"}</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>CI/CD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{results.codeQuality.metrics.hasTestDir ? "✅" : "❌"}</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>Test Directory</span>
                  </div>
                </div>
              )}
            </div>

            {results.codeQuality.issues?.length > 0 && (
              <div className="mt-4">
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Issues Found:
                </h4>
                <div className="space-y-2">
                  {results.codeQuality.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityBadge(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                          {issue.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div
            className={`${
              isDark ? "bg-slate-800" : "bg-white"
            } rounded-xl shadow-lg p-6 border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-4 flex items-center gap-2`}
            >
              <span className="text-2xl">🔐</span>
              Security
            </h3>
            
            <div className={`text-3xl font-bold ${getScoreColor(results.security.score)} mb-4`}>
              {results.security.score}/100
            </div>

            {results.security.vulnerabilities?.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Vulnerabilities:
                </h4>
                <div className="space-y-2">
                  {results.security.vulnerabilities.map((vuln, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityBadge(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                        <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                          {vuln.package || vuln.file}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} ml-2`}>
                        {vuln.issue}
                      </p>
                      {vuln.recommendation && (
                        <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-600"} ml-2 mt-1`}>
                          💡 {vuln.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.security.vulnerabilities?.length === 0 && (
              <div className={`p-4 rounded-lg ${isDark ? "bg-green-500/10" : "bg-green-50"} border ${isDark ? "border-green-500/30" : "border-green-200"}`}>
                <p className={`${isDark ? "text-green-400" : "text-green-700"} font-semibold`}>
                  ✅ No vulnerabilities detected
                </p>
              </div>
            )}

            {results.security.warnings?.length > 0 && (
              <div className="mt-4">
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Warnings:
                </h4>
                <ul className="space-y-1">
                  {results.security.warnings.map((warning, idx) => (
                    <li key={idx} className={`text-sm ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>
                      ⚠️ {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Test Readiness Card */}
          <div
            className={`${
              isDark ? "bg-slate-800" : "bg-white"
            } rounded-xl shadow-lg p-6 border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-4 flex items-center gap-2`}
            >
              <span className="text-2xl">🧪</span>
              Test Readiness
            </h3>
            
            <div className={`text-3xl font-bold ${getScoreColor(results.testReadiness.score)} mb-4`}>
              {results.testReadiness.score}/100
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>Has Tests</span>
                <span className={results.testReadiness.hasTests ? "text-green-400" : "text-red-400"}>
                  {results.testReadiness.hasTests ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              {results.testReadiness.testFramework && (
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Framework</span>
                  <span className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                    {results.testReadiness.testFramework}
                  </span>
                </div>
              )}
              {results.testReadiness.coverage && (
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Coverage</span>
                  <span className="text-green-400">{results.testReadiness.coverage}</span>
                </div>
              )}
            </div>

            {results.testReadiness.issues?.length > 0 && (
              <div>
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Issues:
                </h4>
                <div className="space-y-2">
                  {results.testReadiness.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityBadge(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {issue.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          <div
            className={`${
              isDark ? "bg-slate-800" : "bg-white"
            } rounded-xl shadow-lg p-6 border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-4 flex items-center gap-2`}
            >
              <span className="text-2xl">🤖</span>
              AI Analysis
            </h3>
            
            <div className={`text-3xl font-bold ${getScoreColor(results.aiAnalysis.score)} mb-4`}>
              {results.aiAnalysis.score}/100
            </div>

            {results.aiAnalysis.insights?.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Insights:
                </h4>
                <ul className="space-y-2">
                  {results.aiAnalysis.insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-blue-500/10" : "bg-blue-50"
                      } border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}
                    >
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                        💡 {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.aiAnalysis.suggestions?.length > 0 && (
              <div>
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Suggestions:
                </h4>
                <ul className="space-y-2">
                  {results.aiAnalysis.suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-purple-500/10" : "bg-purple-50"
                      } border ${isDark ? "border-purple-500/30" : "border-purple-200"}`}
                    >
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                        🚀 {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Performance Section - Full Width */}
        {results.performance && (
          <div
            className={`${
              isDark ? "bg-slate-800" : "bg-white"
            } rounded-xl shadow-lg p-6 border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-4 flex items-center gap-2`}
            >
              <span className="text-2xl">⚡</span>
              Performance
            </h3>
            
            <div className={`text-3xl font-bold ${getScoreColor(results.performance.score)} mb-4`}>
              {results.performance.score}/100
            </div>

            {results.performance.issues?.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Issues:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.performance.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-slate-700/50" : "bg-slate-100"
                      }`}
                    >
                      <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"} mb-1`}>
                        {issue.message}
                      </p>
                      {issue.suggestion && (
                        <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          💡 {issue.suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.performance.suggestions?.length > 0 && (
              <div>
                <h4 className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"} mb-2`}>
                  Suggestions:
                </h4>
                <ul className="space-y-2">
                  {results.performance.suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-green-500/10" : "bg-green-50"
                      } border ${isDark ? "border-green-500/30" : "border-green-200"}`}
                    >
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                        ⚡ {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderResultsByType = () => {
    if (results.codacy) {
      return renderCodacyResults(results.codacy);
    }
    if (results.githubCodeScanning) {
      return renderGitHubCodeScanningResults(results.githubCodeScanning);
    }
    if (results.sonarcloud) {
      return renderSonarCloudResults(results.sonarcloud);
    }
    return renderCustomResults();
  };

  // Main Component Return
  return (
    <Layout>
      <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>
              Test Results for {owner}/{repo}
            </h1>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-white"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>Overall Score:</span>
                <span className={`ml-2 font-bold text-2xl ${getScoreColor(testing.overallScore)}`}>
                  {testing.overallScore}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-white"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>Grade:</span>
                <span className={`ml-2 font-bold text-2xl ${getGradeColor(testing.grade)}`}>
                  {testing.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Render Results Based on Type */}
          {renderResultsByType()}
        </div>
      </div>
    </Layout>
  );
}
