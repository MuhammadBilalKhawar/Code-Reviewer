import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Grid, Input, Spinner } from "../components/ui";

export default function Repositories() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get(`/api/github/repos`);
        setRepos(res.data || []);
      } catch (err) {
        console.error("Failed to fetch repos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const filteredRepos = useMemo(
    () => repos.filter((repo) => repo.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [repos, searchQuery]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Layout>
      <Container className="py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold" style={{ color: "#E8F1EE" }}>
            Repositories
          </h1>
          <p className="mt-2" style={{ color: "#9DBFB7" }}>
            Connect and analyze your GitHub repositories
          </p>
        </div>

        <div className="mb-8">
          <Input
            label="Search repositories"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading repositories...
            </p>
          </div>
        ) : filteredRepos.length > 0 ? (
          <Grid columns={3} gap={6}>
            {filteredRepos.map((repo) => (
              <Card
                key={repo.id}
                hoverable
                className="cursor-pointer border border-emerald-200/30 bg-carbon-100/90 shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-[0_16px_40px_rgba(13,255,178,0.14)]"
                onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}`)}
              >
                <CardContent className="p-7 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: "#F5FFFB" }}>
                        {repo.name}
                      </h3>
                      <p className="text-sm font-medium" style={{ color: "#B8D9D2" }}>
                        {repo.owner?.login}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm font-semibold">★ {repo.stargazers_count}</Badge>
                  </div>

                  <p className="text-sm leading-relaxed min-h-[44px]" style={{ color: "#C7E2DC" }}>
                    {repo.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    {repo.language ? (
                      <Badge variant="outline" className="text-xs font-semibold">{repo.language}</Badge>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: "#A7C9C0" }}>Unknown language</span>
                    )}
                    <span className="text-xs font-semibold" style={{ color: "#7FD9C2" }}>
                      Updated {formatDate(repo.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                No repositories found
              </h3>
              <p className="mt-2" style={{ color: "#9DBFB7" }}>
                Try a different search term
              </p>
            </CardContent>
          </Card>
        )}
      </Container>
    </Layout>
  );
}
