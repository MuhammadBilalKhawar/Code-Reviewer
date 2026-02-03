import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Button, Card, CardContent, Container, Flex, Grid, Badge, Spinner } from "../components/ui";
import { IssuesList } from "../components/IssueCard";

export default function ReviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const totals = useMemo(
    () =>
      issues.reduce(
        (acc, i) => {
          acc.total += 1;
          acc[i.severity || "low"] = (acc[i.severity || "low"] || 0) + 1;
          return acc;
        },
        { total: 0, high: 0, medium: 0, low: 0 }
      ),
    [issues]
  );

  const filteredIssues = useMemo(
    () =>
      issues.filter((i) =>
        filter === "all" ? true : (i.severity || "low").toLowerCase() === filter
      ),
    [issues, filter]
  );

  const issuesByFile = useMemo(
    () =>
      filteredIssues.reduce((acc, issue) => {
        const file = issue.file || "Unknown file";
        if (!acc[file]) acc[file] = [];
        acc[file].push({
          file,
          severity: (issue.severity || "low").toLowerCase(),
          message: issue.message || "Issue detected",
          lineNumber: issue.line || issue.lineNumber || "-",
          suggestion: issue.suggestion || issue.fix || issue.recommendation,
        });
        return acc;
      }, {}),
    [filteredIssues]
  );

  return (
    <Layout>
      <Container className="py-6 md:py-12 px-4">
        <Flex justify="between" align="start" className="mb-6 md:mb-10 flex-col sm:flex-row gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              Review Results
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              AI analysis for {review?.repository || "repository"}
            </p>
          </div>
          <Badge variant="info" className="text-xs">
            {review?.status || "Complete"}
          </Badge>
        </Flex>

        {loading ? (
          <Flex direction="col" align="center" justify="center" className="py-24">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading review...
            </p>
          </Flex>
        ) : (
          <>
            <Card gradient hoverable className="mb-6 md:mb-10">
              <CardContent className="p-5 md:p-8">
                <Flex justify="between" align="start" className="mb-4 md:mb-6 flex-col sm:flex-row gap-3">
                  <h2 className="text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                    Summary
                  </h2>
                  <Badge variant="success">Analysis Complete</Badge>
                </Flex>
                <Grid columns={4} gap={4}>
                  <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: "#E8F1EE" }}>
                      {totals.total}
                    </p>
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: "#FF6B5B" }}>
                      {totals.high}
                    </p>
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: "#F2C46B" }}>
                      {totals.medium}
                    </p>
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: "#6DB1A2" }}>
                      {totals.low}
                    </p>
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>Low</p>
                  </div>
                </Grid>
              </CardContent>
            </Card>

            <Flex gap={3} className="mb-8 flex-wrap">
              {["all", "high", "medium", "low"].map((level) => (
                <Button
                  key={level}
                  variant={filter === level ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setFilter(level)}
                >
                  {level === "all" ? "All Issues" : `${level} severity`}
                </Button>
              ))}
            </Flex>

            {Object.keys(issuesByFile).length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                    No issues found for this filter
                  </h3>
                  <p className="mt-2" style={{ color: "#9DBFB7" }}>
                    Try a different severity filter
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(issuesByFile).map(([file, fileIssues]) => (
                  <Card key={file}>
                    <CardContent className="p-6">
                      <Flex justify="between" align="center" className="mb-6">
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: "#E8F1EE" }}>
                            {file}
                          </h3>
                          <p className="text-sm" style={{ color: "#9DBFB7" }}>
                            {fileIssues.length} issue{fileIssues.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{fileIssues.length}</Badge>
                      </Flex>
                      <IssuesList issues={fileIssues} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}
