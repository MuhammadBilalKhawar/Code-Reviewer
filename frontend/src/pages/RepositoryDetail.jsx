import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Spinner } from "../components/ui";

export default function RepositoryDetail() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [pulls, setPulls] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prRes, commitsRes] = await Promise.all([
          api.get(`/api/github/repos/${owner}/${repo}/pull-requests`),
          api.get(`/api/github/repos/${owner}/${repo}/commits`),
        ]);
        setPulls(prRes.data || []);
        setCommits(commitsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch repo details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, repo]);

  const runTests = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/testing", { owner, repo });
      navigate(`/repos/${owner}/${repo}/test/${res.data.testing._id}`);
    } catch (err) {
      console.error("Failed to run tests", err);
      alert("Failed to run tests. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container className="py-6 md:py-12 px-4">
        <Flex justify="between" align="start" className="mb-6 md:mb-10 flex-col sm:flex-row gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/repositories")}>
              Back to Repositories
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              {repo}
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              {owner}/{repo}
            </p>
          </div>
          <Button variant="primary" size="sm" className="w-full sm:w-auto" onClick={runTests}>
            Run Full Test Suite
          </Button>
        </Flex>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading pull requests & commits...
            </p>
          </div>
        ) : (
          <Grid columns={1} gap={6} responsive={false} className="lg:grid-cols-2 md:gap-8">
            <Card className="border border-emerald-200/25 bg-carbon-100/90 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
              <CardContent className="p-5 md:p-6">
                <Flex justify="between" align="center" className="mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                      Pull Requests
                    </h2>
                    <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                      {pulls.length} total
                    </p>
                  </div>
                  <Badge variant="info">PRs</Badge>
                </Flex>

                <div className="space-y-3 md:space-y-4 max-h-[420px] md:max-h-[520px] overflow-y-auto">
                  {pulls.length > 0 ? (
                    pulls.map((pr) => (
                      <Card key={pr.id} className="border border-emerald-200/20 bg-carbon-100/70 hover:border-emerald-200/45 transition-colors">
                        <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary">#{pr.number}</Badge>
                              <h3 className="font-semibold text-sm md:text-base" style={{ color: "#E8F1EE" }}>
                                {pr.title}
                              </h3>
                            </div>
                            <p className="text-xs md:text-sm mt-1" style={{ color: "#9DBFB7" }}>
                              {pr.user?.login} • {new Date(pr.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Flex justify="between" align="center" className="flex-col sm:flex-row gap-2">
                            <Badge variant={pr.state === "open" ? "success" : "secondary"}>
                              {pr.state === "open" ? "Open" : "Merged"}
                            </Badge>
                            <Button size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => navigate(`/repos/${owner}/${repo}/pull/${pr.number}`)}>
                              Run AI Review
                            </Button>
                          </Flex>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>
                      No pull requests found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200/25 bg-carbon-100/90 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
              <CardContent className="p-5 md:p-6">
                <Flex justify="between" align="center" className="mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                      Commits
                    </h2>
                    <p className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                      {commits.length} total
                    </p>
                  </div>
                  <Badge variant="info">Commits</Badge>
                </Flex>

                <div className="space-y-3 md:space-y-4 max-h-[420px] md:max-h-[520px] overflow-y-auto">
                  {commits.length > 0 ? (
                    commits.map((commit) => (
                      <Card key={commit.sha} className="border border-emerald-200/20 bg-carbon-100/70 hover:border-emerald-200/45 transition-colors">
                        <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm md:text-base" style={{ color: "#E8F1EE" }}>
                              {commit.commit?.message?.split("\n")[0] || "Commit"}
                            </h3>
                            <p className="text-xs md:text-sm mt-1" style={{ color: "#9DBFB7" }}>
                              {commit.author?.login || commit.commit?.author?.name} • {new Date(commit.commit?.author?.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Flex justify="between" align="center" className="flex-col sm:flex-row gap-2">
                            <Badge variant="secondary">{commit.sha.substring(0, 7)}</Badge>
                            <Button size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => navigate(`/repos/${owner}/${repo}/commit/${commit.sha}`)}>
                              Run AI Review
                            </Button>
                          </Flex>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: "#9DBFB7" }}>
                      No commits found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Container>
    </Layout>
  );
}
