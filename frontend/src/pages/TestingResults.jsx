import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Spinner, ErrorAlert } from "../components/ui";

export default function TestingResults() {
  const { owner, repo, testId } = useParams();
  const navigate = useNavigate();
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

  const results = testing?.results || testing?.result || testing?.data || {};
  const resultEntries = useMemo(() => {
    if (!results || typeof results !== "object") return [];
    return Object.entries(results || {});
  }, [results]);

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

  const extractIssues = (section) => {
    if (!section || typeof section !== "object") return [];
    if (Array.isArray(section.issues)) return section.issues;
    if (Array.isArray(section.topIssues)) return section.topIssues;
    if (Array.isArray(section.allIssues)) return section.allIssues;
    if (Array.isArray(section.issuesByFile)) {
      return section.issuesByFile.flatMap((file) =>
        (file.issues || []).map((issue) => ({ ...issue, file: issue.file || file.file }))
      );
    }
    return [];
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

  const renderIssues = (issues) => {
    if (!Array.isArray(issues) || issues.length === 0) {
      return <p className="text-sm" style={{ color: "#9DBFB7" }}>No issues reported.</p>;
    }
    return (
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div key={`${issue?.message || issue?.type || issue}-${index}`} className="rounded-lg border border-emerald-200/15 bg-carbon-50/60 p-4">
            <Flex justify="between" align="center" className="mb-2">
              <span className="text-sm font-semibold" style={{ color: "#E8F1EE" }}>
                {formatLabel(issue?.type || "Issue")}
              </span>
              <Badge variant={issue?.severity === "high" ? "error" : issue?.severity === "medium" ? "warning" : "secondary"}>
                {formatLabel(issue?.severity || "info")}
              </Badge>
            </Flex>
            <p className="text-sm" style={{ color: "#C7E2DC" }}>
              {formatText(issue?.message || issue?.type || issue || "No details provided.")}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderMetrics = (metrics) => {
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      return null;
    }
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
            <Button variant="ghost" size="sm" onClick={() => navigate(`/repos/${owner}/${repo}`)}>
              ← Back to Repository
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              Testing Results
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              {owner}/{repo}
            </p>
          </div>
          <Badge variant="info">Test #{testId?.slice(0, 6) || "-"}</Badge>
        </Flex>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading test results...
            </p>
          </div>
        ) : error || !testing ? (
          <ErrorAlert message={error || "Test results not found"} onClose={() => setError(null)} />
        ) : (
          <>
            <Grid columns={3} gap={6} className="mb-10">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm" style={{ color: "#9DBFB7" }}>Repository</p>
                  <p className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                    {testing.owner}/{testing.repo}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm" style={{ color: "#9DBFB7" }}>Status</p>
                  <p className="text-xl font-bold" style={{ color: "#6DB1A2" }}>
                    {testing.status || "Complete"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm" style={{ color: "#9DBFB7" }}>Created</p>
                  <p className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                    {new Date(testing.createdAt || Date.now()).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Grid>

            {resultEntries.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                    No results available
                  </h3>
                  <p className="mt-2" style={{ color: "#9DBFB7" }}>
                    The test did not return result data.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {resultEntries.map(([key, section]) => {
                  const normalizedSection = normalizeSection(section);
                  return (
                  <Card key={key}>
                    <CardContent className="p-6">
                      <Flex justify="between" align="center" className="mb-4">
                        <h3 className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                          {key.toUpperCase()}
                        </h3>
                        {normalizedSection?.score !== undefined ? (
                          <Badge variant="info">Score {normalizedSection.score}</Badge>
                        ) : (
                          <Badge variant="secondary">Section</Badge>
                        )}
                      </Flex>
                      {normalizedSection?.summary && (
                        <p className="text-sm mb-4" style={{ color: "#C7E2DC" }}>
                          {formatText(normalizedSection.summary)}
                        </p>
                      )}

                      {extractIssues(normalizedSection).length > 0 && (
                        <div className="mb-5">
                          <p className="text-sm font-semibold mb-3" style={{ color: "#E8F1EE" }}>
                            Issues
                          </p>
                          {renderIssues(extractIssues(normalizedSection))}
                        </div>
                      )}

                      {normalizedSection?.metrics && (
                        <div>
                          <p className="text-sm font-semibold mb-3" style={{ color: "#E8F1EE" }}>
                            Metrics
                          </p>
                          {renderMetrics(normalizedSection.metrics)}
                        </div>
                      )}

                      {!normalizedSection?.summary && !normalizedSection?.metrics && extractIssues(normalizedSection).length === 0 && (
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
          </>
        )}
      </Container>
    </Layout>
  );
}
