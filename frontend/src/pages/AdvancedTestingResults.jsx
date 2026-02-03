import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Spinner, ErrorAlert } from "../components/ui";

export default function AdvancedTestingResults() {
  const { owner, repo, testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allTestResults, setAllTestResults] = useState([]);
  const [error, setError] = useState(null);
  const [setupLoading, setSetupLoading] = useState({});
  const [commitSuccess, setCommitSuccess] = useState({});

  useEffect(() => {
    if (testId && owner && repo) {
      fetchTestResults();
    }
  }, [testId, owner, repo]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      
      // Parse test IDs (can be comma-separated for multiple tests)
      const testIds = testId.includes(',') ? testId.split(',') : [testId];
      
      // Fetch all test results
      const results = await Promise.all(
        testIds.map(id => api.get(`/api/testing/${id}`).catch(err => {
          console.error(`Failed to fetch test ${id}:`, err);
          return null;
        }))
      );
      
      // Filter out failed fetches and set results
      const validResults = results.filter(r => r && r.data).map(r => r.data);
      setAllTestResults(validResults);
    } catch (err) {
      console.error("Failed to fetch test result", err);
      setError("Failed to load test results: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCommitWorkflow = async (testName, section) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `🚀 Commit Workflow to GitHub?\n\n` +
      `This will add "${section.workflowName}" to your repository's GitHub Actions.\n\n` +
      `Location: .github/workflows/${section.workflowName}\n` +
      `Test Type: ${testName.replace('dynamic-', '').toUpperCase()}\n` +
      `Branch: ${section.defaultBranch || 'main'}\n\n` +
      `The workflow will run automatically on every push and pull request.\n\n` +
      `Do you want to continue?`
    );

    if (!confirmed) {
      return; // User cancelled
    }

    try {
      setSetupLoading((prev) => ({ ...prev, [testName]: true }));
      
      await api.post("/api/testing/commit-workflow", {
        owner,
        repo,
        workflowName: section.workflowName,
        yaml: section.yaml,
        defaultBranch: section.defaultBranch,
      });

      setCommitSuccess((prev) => ({ ...prev, [testName]: true }));
      
      // Show success for 3 seconds
      setTimeout(() => {
        setCommitSuccess((prev) => ({ ...prev, [testName]: false }));
      }, 3000);
    } catch (err) {
      console.error("Failed to commit workflow", err);
      alert("Failed to commit workflow: " + (err.response?.data?.error || err.message));
    } finally {
      setSetupLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Extract issues from a section
  const extractIssues = (section) => {
    if (!section || typeof section !== "object") return [];
    if (Array.isArray(section.issues)) return section.issues;
    if (Array.isArray(section.allErrors)) return section.allErrors;
    if (Array.isArray(section.allWarnings)) return section.allWarnings;
    if (Array.isArray(section.vulnerabilities)) return section.vulnerabilities;
    if (Array.isArray(section.topIssues)) return section.topIssues;
    if (Array.isArray(section.allIssues)) return section.allIssues;
    if (Array.isArray(section.issuesByFile)) {
      return section.issuesByFile.flatMap((file) =>
        (file.issues || []).map((issue) => ({ ...issue, file: issue.file || file.file }))
      );
    }
    if (section.issues?.critical) return section.issues.critical;
    if (section.issues?.high) return section.issues.high;
    return [];
  };

  const normalizeSection = (section) => {
    const normalized = section && typeof section === "object" && !Array.isArray(section)
      ? section
      : { summary: String(section ?? "-") };

    const extraMetrics = {};
    if (normalized.filesAnalyzed !== undefined) extraMetrics.filesAnalyzed = normalized.filesAnalyzed;
    if (normalized.totalIssues !== undefined) extraMetrics.totalIssues = normalized.totalIssues;
    if (normalized.score !== undefined) extraMetrics.score = normalized.score;
    if (normalized.grade) extraMetrics.grade = normalized.grade;

    const mergedMetrics = normalized.metrics && typeof normalized.metrics === "object" && !Array.isArray(normalized.metrics)
      ? { ...extraMetrics, ...normalized.metrics }
      : Object.keys(extraMetrics).length
        ? extraMetrics
        : normalized.metrics;

    return { ...normalized, metrics: mergedMetrics };
  };

  const formatLabel = (value) =>
    String(value)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, (c) => c.toUpperCase());

  const formatValue = (value) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
    if (typeof value === "object") {
      const entries = Object.entries(value).filter(([, v]) =>
        ["string", "number", "boolean"].includes(typeof v)
      );
      if (entries.length === 0) return "Available";
      return entries
        .map(([key, v]) => `${formatLabel(key)}: ${v}`)
        .join(", ");
    }
    return String(value);
  };

  const formatText = (value) => {
    if (typeof value === "object") return formatValue(value);
    return value ? String(value) : "-";
  };

  const handleAutoSetup = async (serviceKey) => {
    setSetupLoading((prev) => ({ ...prev, [serviceKey]: true }));
    try {
      const endpoint = {
        githubCodeScanning: "/api/setup/github-code-scanning",
        sonarcloud: "/api/setup/sonarcloud",
      }[serviceKey];

      if (!endpoint) throw new Error("Unknown service");

      const response = await api.post(endpoint, { owner, repo });

      if (response.data.success) {
        alert(`✅ Setup successful!\n\n${response.data.message}\n\n${response.data.nextSteps?.join("\n") || ""}`);
        
        // Refresh the test after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(`⚠️ ${response.data.message}\n\n${response.data.manualSteps?.join("\n") || ""}`);
      }
    } catch (err) {
      console.error("Auto-setup failed:", err);
      alert("Failed to auto-setup: " + (err.response?.data?.message || err.message));
    } finally {
      setSetupLoading((prev) => ({ ...prev, [serviceKey]: false }));
    }
  };

  const renderIssues = (issues) => {
    if (!Array.isArray(issues) || issues.length === 0) {
      return <p className="text-sm" style={{ color: "#9DBFB7" }}>No issues reported.</p>;
    }
    return (
      <div className="space-y-3">
        {issues.slice(0, 10).map((issue, idx) => (
          <div key={`${issue?.message || issue?.title}-${idx}`} className="rounded-lg border border-emerald-200/15 bg-carbon-50/60 p-4">
            <Flex justify="between" align="center" className="mb-2">
              <span className="text-sm font-semibold" style={{ color: "#E8F1EE" }}>
                {formatText(issue?.message || issue?.title || "Issue detected")}
              </span>
              {issue?.severity && (
                <Badge variant={issue?.severity === "high" ? "error" : issue?.severity === "medium" ? "warning" : "secondary"}>
                  {formatLabel(issue?.severity)}
                </Badge>
              )}
            </Flex>
            <p className="text-xs" style={{ color: "#9DBFB7" }}>
              {issue?.file ? `${issue.file}${issue.line ? `:${issue.line}` : ""}` : ""}
            </p>
          </div>
        ))}
        {issues.length > 10 && (
          <p className="text-xs" style={{ color: "#9DBFB7" }}>
            Showing 10 of {issues.length} issues
          </p>
        )}
      </div>
    );
  };

  const renderMetrics = (metrics) => {
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) return null;
    const entries = Object.entries(metrics);
    if (entries.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map(([metricKey, metricValue]) => (
          <div key={metricKey} className="rounded-lg border border-emerald-200/15 bg-carbon-100/60 p-3">
            <p className="text-xs uppercase tracking-wide" style={{ color: "#9DBFB7" }}>
              {formatLabel(metricKey)}
            </p>
            <p className="text-sm font-semibold" style={{ color: "#E8F1EE" }}>
              {formatValue(metricValue)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <Container className="py-6 md:py-12 px-4">
        <Flex justify="between" align="start" className="mb-6 md:mb-10 flex-col sm:flex-row gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/advanced-testing")}>
              ← Back to Testing
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              Test Results
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              {owner}/{repo} • {allTestResults.length} test{allTestResults.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <Badge variant="success" className="self-start sm:self-auto">{allTestResults.length} Tests</Badge>
        </Flex>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading test results...
            </p>
          </div>
        ) : error || allTestResults.length === 0 ? (
          <ErrorAlert message={error || "Test results not found"} onClose={() => setError(null)} />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
              {allTestResults.map((testing, idx) => (
                <Card key={testing._id || idx}>
                  <CardContent className="p-3 md:p-4">
                    <Badge 
                      variant={testing.status === 'COMPLETED' ? 'success' : testing.status === 'ERROR' ? 'error' : 'default'}
                      className="mb-2 text-xs"
                    >
                      {testing.testType?.replace('dynamic-', '') || 'Test'}
                    </Badge>
                    <p className="text-2xl md:text-3xl font-bold" style={{ color: "#E8F1EE" }}>
                      {testing.overallScore || 0}%
                    </p>
                    <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                      Grade: {testing.grade || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* All Test Results */}
            {allTestResults.map((testing, testIndex) => {
              const results = testing?.results || testing?.result || testing?.data || {};
              const resultEntries = Object.entries(results || {});
              
              return (
                <div key={testing._id || testIndex} className="mb-8 md:mb-12">
                  {/* Test Header */}
                  <Card className="mb-4 md:mb-6 bg-gradient-to-r from-copper/10 to-emerald/10">
                    <CardContent className="p-4 md:p-6">
                      <Flex justify="between" align="start" className="flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "#E8F1EE" }}>
                            {testing.testType?.replace('dynamic-', '').toUpperCase() || 'Test'} Results
                          </h2>
                          <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                            Completed: {new Date(testing.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl md:text-4xl font-bold" style={{ color: "#C47A3A" }}>
                            {testing.overallScore || 0}%
                          </div>
                          <Badge variant={testing.grade === 'A+' || testing.grade === 'A' ? 'success' : testing.grade === 'F' ? 'error' : 'warning'}>
                            Grade {testing.grade || 'N/A'}
                          </Badge>
                        </div>
                      </Flex>
                    </CardContent>
                  </Card>

                  {/* Test Details */}
                  {resultEntries.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 md:py-16 text-center px-4">
                        <div className="text-4xl md:text-5xl mb-4">📊</div>
                        <h3 className="text-lg md:text-xl font-bold" style={{ color: "#E8F1EE" }}>
                          No detailed results available
                        </h3>
                        <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
                          The test completed but did not return detailed data.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      {resultEntries.map(([key, section]) => {
                        const normalizedSection = normalizeSection(section);
                        const issues = extractIssues(normalizedSection);
                  
                  // Check if this is a dynamic AI test
                  if (key.startsWith("dynamic-")) {
                    return (
                      <Card key={key} className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-400/30">
                        <CardContent className="p-4 md:p-6">
                          <Flex justify="between" align="start" className="mb-4 flex-col sm:flex-row gap-3">
                            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: "#E8F1EE" }}>
                              <span className="text-2xl md:text-3xl">🤖</span>
                              {key.toUpperCase().replace("DYNAMIC-", "")} - AI ANALYSIS
                            </h3>
                            {normalizedSection?.score !== undefined && (
                              <div className="flex items-center gap-2">
                                <Badge variant="info" className="text-base md:text-lg px-3 py-1 md:px-4 md:py-2">
                                  Score: {normalizedSection.score}
                                </Badge>
                                <Badge variant={normalizedSection.grade === "A+" || normalizedSection.grade === "A" ? "success" : normalizedSection.grade === "F" ? "error" : "warning"} className="text-lg px-4 py-2">
                                  {normalizedSection.grade}
                                </Badge>
                              </div>
                            )}
                          </Flex>

                          {normalizedSection.status === "running" && (
                            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(109, 177, 162, 0.15)", borderLeft: "3px solid #6DB1A2" }}>
                              <Flex align="center" gap={3}>
                                <Spinner />
                                <div>
                                  <p className="font-semibold" style={{ color: "#6DB1A2" }}>Test Running</p>
                                  <p className="text-sm" style={{ color: "#C7E2DC" }}>
                                    {normalizedSection.message || "GitHub Actions workflow is running..."}
                                  </p>
                                </div>
                              </Flex>
                            </div>
                          )}

                          {normalizedSection.conclusion && (
                            <div className={`p-4 rounded-lg mb-4 ${normalizedSection.conclusion === "success" ? "bg-emerald-500/10 border-l-4 border-emerald-500" : "bg-red-500/10 border-l-4 border-red-500"}`}>
                              <p className="font-semibold text-sm mb-1" style={{ color: normalizedSection.conclusion === "success" ? "#6DB1A2" : "#EF4444" }}>
                                {normalizedSection.conclusion === "success" ? "✅ Tests Passed" : "❌ Tests Failed"}
                              </p>
                            </div>
                          )}

                          {normalizedSection.analysis && (
                            <div className="mb-4 p-5 rounded-lg" style={{ backgroundColor: "rgba(196, 122, 58, 0.08)", border: "1px solid rgba(196, 122, 58, 0.2)" }}>
                              <Flex align="center" gap={2} className="mb-3">
                                <span className="text-xl">🧠</span>
                                <p className="font-bold" style={{ color: "#C47A3A" }}>AI Analysis</p>
                              </Flex>
                              <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "#E8F1EE" }}>
                                {normalizedSection.analysis}
                              </p>
                            </div>
                          )}

                          {normalizedSection.yaml && (
                            <>
                              <details className="mb-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(109, 177, 162, 0.08)", border: "1px solid rgba(109, 177, 162, 0.2)" }}>
                                <summary className="cursor-pointer font-semibold text-sm mb-2" style={{ color: "#6DB1A2" }}>
                                  📄 View Generated Workflow YAML
                                </summary>
                                <pre className="text-xs mt-3 p-3 rounded overflow-x-auto" style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#E8F1EE" }}>
                                  {normalizedSection.yaml}
                                </pre>
                              </details>
                              
                              {normalizedSection.canCommit && (
                                <div className="mb-4 p-3 md:p-4 rounded-lg" style={{ background: commitSuccess[key] ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)" : "linear-gradient(135deg, rgba(109, 177, 162, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)", border: commitSuccess[key] ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(109, 177, 162, 0.3)" }}>
                                  <Flex direction="column" gap="3">
                                    <Flex align="start" gap="2" className="flex-col sm:flex-row">
                                      <span style={{ fontSize: "1.25rem", marginTop: "0.25rem" }} className="md:text-2xl">{commitSuccess[key] ? "✅" : "🚀"}</span>
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm md:text-base" style={{ color: commitSuccess[key] ? "#10B981" : "#6DB1A2" }}>
                                          {commitSuccess[key] ? "Workflow Committed!" : "Ready to Deploy"}
                                        </p>
                                        <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                                          {commitSuccess[key] 
                                            ? "Workflow successfully added to your repository" 
                                            : "Commit this workflow to your repository for automated testing"}
                                        </p>
                                      </div>
                                    </Flex>
                                    {!commitSuccess[key] && (
                                      <Button
                                        onClick={() => handleCommitWorkflow(key, normalizedSection)}
                                        disabled={setupLoading[key]}
                                        className="w-full sm:w-auto text-sm md:text-base"
                                        style={{
                                          background: "linear-gradient(135deg, #6DB1A2 0%, #8B5CF6 100%)",
                                          border: "none",
                                          color: "white",
                                          fontWeight: "600",
                                          padding: "0.65rem 1.25rem",
                                          borderRadius: "0.5rem",
                                          cursor: setupLoading[key] ? "wait" : "pointer",
                                          opacity: setupLoading[key] ? 0.7 : 1,
                                          transition: "all 0.3s ease",
                                        }}
                                      >
                                        {setupLoading[key] ? (
                                          <>
                                            <Spinner size="sm" style={{ marginRight: "0.5rem" }} />
                                            Committing...
                                          </>
                                        ) : (
                                          <>📤 Commit Workflow to GitHub</>
                                        )}
                                      </Button>
                                    )}
                                  </Flex>
                                </div>
                              )}
                            </>
                          )}

                          {normalizedSection.logs && normalizedSection.logs.length > 0 && (
                            <details className="mb-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(109, 177, 162, 0.08)", border: "1px solid rgba(109, 177, 162, 0.2)" }}>
                              <summary className="cursor-pointer font-semibold text-sm mb-2" style={{ color: "#6DB1A2" }}>
                                📋 View Job Logs ({normalizedSection.logs.length} jobs)
                              </summary>
                              <div className="space-y-3 mt-3">
                                {normalizedSection.logs.map((job, idx) => (
                                  <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                                    <Flex justify="between" align="center" className="mb-2">
                                      <p className="font-semibold text-sm" style={{ color: "#E8F1EE" }}>{job.name}</p>
                                      <Badge variant={job.conclusion === "success" ? "success" : job.conclusion === "failure" ? "error" : "secondary"}>
                                        {job.conclusion || job.status}
                                      </Badge>
                                    </Flex>
                                    {job.steps && (
                                      <div className="ml-4 space-y-1">
                                        {job.steps.map((step, stepIdx) => (
                                          <div key={stepIdx} className="text-xs flex justify-between" style={{ color: "#9DBFB7" }}>
                                            <span>{step.name}</span>
                                            <span className={step.conclusion === "success" ? "text-emerald-400" : step.conclusion === "failure" ? "text-red-400" : ""}>
                                              {step.conclusion || step.status}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {normalizedSection.workflowUrl && (
                            <Button
                              size="sm"
                              onClick={() => window.open(normalizedSection.workflowUrl, "_blank")}
                              style={{ backgroundColor: "rgba(109, 177, 162, 0.3)" }}
                            >
                              🔗 View on GitHub Actions
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  // Check if this is a "not configured" service
                  if (normalizedSection.status === "NOT_ENABLED" || normalizedSection.status === "NOT_ANALYZED" || (normalizedSection.status === "ERROR" && normalizedSection.setupInstructions)) {
                    return (
                      <Card key={key} className="bg-carbon-50/70 border border-amber-500/30">
                        <CardContent className="p-4 md:p-6">
                          <Flex justify="between" align="start" className="mb-4 flex-col sm:flex-row gap-2">
                            <h3 className="text-lg md:text-xl font-bold" style={{ color: "#E8F1EE" }}>
                              {key.toUpperCase()}
                            </h3>
                            <Badge variant="warning">Setup Required</Badge>
                          </Flex>
                          
                          <div className="mb-4">
                            <p className="text-xs md:text-sm mb-2" style={{ color: "#C7E2DC" }}>
                              {normalizedSection.message || "This service needs to be configured."}
                            </p>
                          </div>

                          {normalizedSection.setupInstructions && (
                            <div className="mb-4 p-3 md:p-4 rounded-lg" style={{ backgroundColor: "rgba(196, 122, 58, 0.1)", borderLeft: "3px solid #C47A3A" }}>
                              <p className="text-xs md:text-sm font-semibold mb-2" style={{ color: "#C47A3A" }}>
                                Setup Instructions:
                              </p>
                              <ol className="list-decimal list-inside space-y-1 text-xs md:text-sm" style={{ color: "#E8F1EE" }}>
                                {normalizedSection.setupInstructions.map((instruction, idx) => (
                                  <li key={idx}>{instruction}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          <Flex gap={2} className="flex-wrap">
                            {/* Auto-Setup Button for services that support it */}
                            {(key === "githubCodeScanning" || key === "sonarcloud") && (
                              <Button
                                size="sm"
                                onClick={() => handleAutoSetup(key)}
                                disabled={setupLoading[key]}
                                style={{ backgroundColor: "rgba(109, 177, 162, 0.4)" }}
                              >
                                {setupLoading[key] ? "⏳ Setting up..." : "🚀 Auto-Setup"}
                              </Button>
                            )}
                            
                            {normalizedSection.documentationUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.open(normalizedSection.documentationUrl, "_blank")}
                                style={{ backgroundColor: "rgba(196, 122, 58, 0.3)" }}
                              >
                                📖 Docs
                              </Button>
                            )}
                            
                            {normalizedSection.dashboardUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.open(normalizedSection.dashboardUrl, "_blank")}
                                style={{ backgroundColor: "rgba(109, 177, 162, 0.3)" }}
                              >
                                🔗 Dashboard
                              </Button>
                            )}
                          </Flex>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  return (
                    <Card key={key} className="bg-carbon-50/70 border border-emerald-200/20">
                      <CardContent className="p-4 md:p-6">
                        <Flex justify="between" align="start" className="mb-4 flex-col sm:flex-row gap-2">
                          <h3 className="text-lg md:text-xl font-bold" style={{ color: "#E8F1EE" }}>
                            {key.toUpperCase()}
                          </h3>
                          {normalizedSection?.error ? (
                            <Badge variant="error">Error</Badge>
                          ) : normalizedSection?.score !== undefined ? (
                            <Badge variant="info">Score {normalizedSection.score}</Badge>
                          ) : issues.length > 0 ? (
                            <Badge variant="warning">{issues.length} issues</Badge>
                          ) : (
                            <Badge variant="success">No issues</Badge>
                          )}
                        </Flex>

                        {normalizedSection?.error && (
                          <div className="mb-4 p-3 md:p-4 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderLeft: "3px solid #EF4444" }}>
                            <p className="text-xs md:text-sm font-semibold mb-1" style={{ color: "#EF4444" }}>
                              Test Error
                            </p>
                            <p className="text-xs md:text-sm" style={{ color: "#E8F1EE" }}>
                              {normalizedSection.error}
                            </p>
                          </div>
                        )}

                        {normalizedSection?.summary && (
                          <p className="text-xs md:text-sm mb-4" style={{ color: "#C7E2DC" }}>
                            {formatText(normalizedSection.summary)}
                          </p>
                        )}

                        <div className="mb-5">
                          <p className="text-xs md:text-sm font-semibold mb-3" style={{ color: "#E8F1EE" }}>
                            Issues
                          </p>
                          {renderIssues(issues)}
                        </div>

                        {normalizedSection?.metrics && (
                          <div>
                            <p className="text-xs md:text-sm font-semibold mb-3" style={{ color: "#E8F1EE" }}>
                              Metrics
                            </p>
                            {renderMetrics(normalizedSection.metrics)}
                          </div>
                        )}

                        {!normalizedSection?.summary && !normalizedSection?.metrics && issues.length === 0 && !normalizedSection?.error && (
                          <p className="text-sm" style={{ color: "#9DBFB7" }}>
                            No extracted insights available for this section.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );})}
          </>
        )}
      </Container>
    </Layout>
  );
}
