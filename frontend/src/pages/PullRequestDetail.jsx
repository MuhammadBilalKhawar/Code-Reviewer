import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Spinner, ErrorAlert } from "../components/ui";

export default function PullRequestDetail() {
  const { owner, repo, number } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get(
          `/api/github/repos/${owner}/${repo}/pull-requests/${number}/files`
        );
        setFiles(res.data || []);
      } catch (err) {
        console.error("Failed to fetch PR files", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [owner, repo, number]);

  const runAiReview = async () => {
    setReviewLoading(true);
    setError("");
    try {
      const res = await api.post(`/api/reviews`, {
        owner,
        repo,
        pullNumber: Number(number),
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
      <Container className="py-6 md:py-12 px-4">
        <Flex justify="between" align="start" className="mb-6 md:mb-10 flex-col sm:flex-row gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/repos/${owner}/${repo}`)}>
              ← Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              Pull Request #{number}
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              {owner}/{repo}
            </p>
          </div>
          <Button size="sm" className="w-full sm:w-auto" onClick={runAiReview} disabled={reviewLoading}>
            {reviewLoading ? "Analyzing..." : "Run AI Review"}
          </Button>
        </Flex>

        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading files...
            </p>
          </div>
        ) : (
          <>
            <Grid columns={1} gap={4} className="mb-6 md:mb-10 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>Files Changed</p>
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: "#E8F1EE" }}>{files.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>Additions</p>
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: "#6DB1A2" }}>+{totalAdditions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 md:p-6">
                  <p className="text-sm" style={{ color: "#9DBFB7" }}>Deletions</p>
                  <p className="text-4xl font-bold" style={{ color: "#FF6B5B" }}>-{totalDeletions}</p>
                </CardContent>
              </Card>
            </Grid>

            <Card>
              <CardContent className="p-6">
                <Flex justify="between" align="center" className="mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                      Files Changed
                    </h2>
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant="info">PR Files</Badge>
                </Flex>

                <div className="space-y-3 max-h-[520px] overflow-y-auto">
                  {files.map((file) => (
                    <Card key={file.sha} className="border border-copper/15">
                      <CardContent className="p-4">
                        <Flex justify="between" align="center">
                          <div>
                            <p className="font-semibold" style={{ color: "#E8F1EE" }}>{file.filename}</p>
                            <p className="text-sm" style={{ color: "#9DBFB7" }}>{file.status}</p>
                          </div>
                          <Flex gap={2}>
                            <Badge variant="success">+{file.additions || 0}</Badge>
                            <Badge variant="error">-{file.deletions || 0}</Badge>
                          </Flex>
                        </Flex>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Layout>
  );
}
