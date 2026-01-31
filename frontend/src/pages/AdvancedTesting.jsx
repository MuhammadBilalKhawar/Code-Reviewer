import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function AdvancedTesting() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    fetchRepos();
    fetchAvailableTests();
    fetchTestHistory();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await api.get("/api/github/repos");
      setRepos(res.data || []);
    } catch (err) {
      console.error("Failed to fetch repos", err);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const res = await api.get("/api/testing/available");
      setAvailableTests(res.data.availableTests || []);
    } catch (err) {
      console.error("Failed to fetch available tests", err);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const res = await api.get("/api/testing/history");
      setTestHistory(res.data.tests || res.data || []);
    } catch (err) {
      console.error("Failed to fetch test history", err);
    }
  };

  const toggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((t) => t !== testId) : [...prev, testId]
    );
  };

  const handleRunTests = async () => {
    if (!selectedRepo) {
      alert("Please select a repository");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please select at least one test");
      return;
    }

    try {
      setTestRunning(true);
      const [owner, repo] = selectedRepo.split("/");

      let response;

      if (selectedTests.length === 1) {
        // Single test
        const testType = selectedTests[0];
        const endpoints = {
          eslint: "/api/testing/eslint",
          stylelint: "/api/testing/stylelint",
          htmlhint: "/api/testing/htmlhint",
          prettier: "/api/testing/prettier",
          markdownlint: "/api/testing/markdownlint",
          "npm-audit": "/api/testing/npm-audit",
          depcheck: "/api/testing/depcheck",
        };

        const endpoint = endpoints[testType];
        if (!endpoint) {
          throw new Error("Unsupported test type");
        }

        response = await api.post(endpoint, { owner, repo });
      } else {
        // Multiple tests
        response = await api.post("/api/testing/multiple", {
          owner,
          repo,
          testTypes: selectedTests,
        });
      }

      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Navigate to advanced testing results
      const testId = response.data.testing?._id || response.data.testId;
      if (!testId) {
        throw new Error("No test ID returned from server");
      }

      navigate(`/advanced-testing-results/${owner}/${repo}/${testId}`);
    } catch (err) {
      console.error("Failed to run tests", err);
      alert("Failed to run tests. " + (err.response?.data?.message || err.message));
      setTestRunning(false);
    }
  };

  return (
    <Layout>
      <div
        className={`min-h-screen p-8 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 ${
                isDark
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              } font-semibold mb-4`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              🧪 Advanced Testing Dashboard
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Select a repository and choose which tests to run
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Configuration */}
            <div
              className={`lg:col-span-1 ${
                isDark ? "bg-slate-800" : "bg-white"
              } rounded-xl shadow-lg p-6 border ${
                isDark ? "border-slate-700" : "border-slate-200"
              } h-fit`}
            >
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                } mb-6`}
              >
                Test Configuration
              </h2>

              {/* Repository Selection */}
              <div className="mb-8">
                <label
                  className={`block font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  } mb-3`}
                >
                  📁 Select Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">Choose a repository...</option>
                  {repos.map((repo) => (
                    <option
                      key={repo.id}
                      value={`${repo.owner.login}/${repo.name}`}
                    >
                      {repo.owner.login}/{repo.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunTests}
                disabled={testRunning || !selectedRepo || selectedTests.length === 0}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  testRunning || !selectedRepo || selectedTests.length === 0
                    ? "bg-slate-500 cursor-not-allowed opacity-50"
                    : isDark
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {testRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Run Selected Tests
                  </>
                )}
              </button>

              {selectedTests.length > 0 && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    isDark ? "bg-blue-500/10" : "bg-blue-50"
                  } border ${isDark ? "border-blue-500/30" : "border-blue-200"}`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    ✓ {selectedTests.length} test(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Right Content - Test Selection */}
            <div className="lg:col-span-2">
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                } mb-6`}
              >
                Available Tests
              </h2>

              <div className="space-y-4">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    onClick={() => !test.status?.includes("coming") && toggleTest(test.id)}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedTests.includes(test.id)
                        ? isDark
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-400 bg-purple-50"
                        : isDark
                        ? "border-slate-700 bg-slate-800 hover:border-slate-600"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${test.status?.includes("coming") ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test.id)}
                          onChange={() => toggleTest(test.id)}
                          disabled={test.status?.includes("coming")}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{test.icon}</span>
                          <h3
                            className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {test.name}
                          </h3>
                          {test.status?.includes("coming") && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-600">
                              Coming Soon
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm mb-4 ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {test.description}
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-2">
                          {test.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                isDark
                                  ? "bg-slate-700 text-slate-300"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              ✓ {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Test Badge */}
                      {selectedTests.includes(test.id) && (
                        <div className="flex-shrink-0">
                          <div className="text-2xl">✅</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div
                className={`mt-8 p-6 rounded-xl border ${
                  isDark
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <h3
                  className={`font-bold mb-2 ${
                    isDark ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  💡 How it Works
                </h3>
                <ul
                  className={`text-sm space-y-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <li>• Select a repository from your GitHub account</li>
                  <li>• Choose one or more testing tools</li>
                  <li>• Click "Run Selected Tests" to analyze</li>
                  <li>• View comprehensive results and recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test History Section */}
          {testHistory.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  📋 Recent Test Results
                </h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {showHistory ? "Hide" : "Show"} History
                </button>
              </div>

              {showHistory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testHistory.slice(0, 9).map((test) => (
                    <div
                      key={test._id}
                      className={`p-5 rounded-xl border ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-slate-200"
                      } shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3
                            className={`font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {test.owner}/{test.repo}
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-500" : "text-slate-500"
                            }`}
                          >
                            {new Date(test.createdAt).toLocaleDateString()} at{" "}
                            {new Date(test.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            test.overallScore >= 80
                              ? "bg-green-500/20 text-green-500"
                              : test.overallScore >= 60
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {test.overallScore}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {test.testType?.split(",").map((type, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {type.trim()}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/advanced-testing-results/${test.owner}/${test.repo}/${test._id}`
                          )
                        }
                        className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                          isDark
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-purple-500 hover:bg-purple-600 text-white"
                        }`}
                      >
                        View Results →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
