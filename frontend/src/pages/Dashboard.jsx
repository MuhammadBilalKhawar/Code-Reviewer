import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { 
  Button, 
  Card, 
  CardContent,
  Container,
  Grid,
  Flex,
  Badge,
  Spinner
} from "../components/ui";
import { StatsGrid, MetricCard } from "../components/StatsCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);

        const [statsRes, testRes] = await Promise.all([
          api.get(`/api/reviews/stats`),
          api.get(`/api/testing/history`)
        ]);
        
        setStats(statsRes.data);
        setTestHistory(testRes.data.tests || testRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Container>
          <Flex direction="col" justify="center" align="center" className="h-screen">
            <Spinner size="lg" />
            <p className="mt-6 text-lg" style={{ color: '#9DBFB7' }}>
              Loading your dashboard...
            </p>
          </Flex>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-6 md:py-12 px-4">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
            Welcome back, <span style={{ color: '#C47A3A' }}>{user?.login || "Developer"}</span>!
          </h1>
          <p className="text-base md:text-lg" style={{ color: '#9DBFB7' }}>
            Your code review dashboard and analytics
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#E8F1EE' }}>Performance Metrics</h2>
          <StatsGrid stats={[
            {
              icon: "📊",
              label: "Total Reviews",
              value: stats?.totalReviews || "0",
              variant: "default"
            },
            {
              icon: "⚡",
              label: "PRs Analyzed",
              value: stats?.prsAnalyzed || "0",
              variant: "success"
            },
            {
              icon: "🔴",
              label: "High Severity",
              value: stats?.highSeverity || "0",
              variant: "error"
            },
            {
              icon: "⏱️",
              label: "Avg Review Time",
              value: (stats?.avgTime || "0") + "s",
              variant: "default"
            }
          ]} />
        </div>

        {/* Action Cards Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: '#E8F1EE' }}>Quick Actions</h2>
          <Grid columns={1} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            {/* Start New Review */}
            <Card 
              gradient
              hoverable
              className="group cursor-pointer transition-all"
              onClick={() => navigate("/repositories")}
              style={{ 
                background: 'linear-gradient(135deg, rgba(196, 122, 58, 0.15), rgba(109, 177, 162, 0.15))',
                borderColor: 'rgba(196, 122, 58, 0.3)'
              }}
            >
              <CardContent className="p-6 md:p-8">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">🔍</div>
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
                  Start New Review
                </h3>
                <p className="text-sm md:text-base" style={{ color: '#9DBFB7' }}>
                  Browse and analyze your repositories
                </p>
              </CardContent>
            </Card>

            {/* Advanced Testing */}
            <Card 
              gradient
              hoverable
              className="group cursor-pointer transition-all"
              onClick={() => navigate("/advanced-testing")}
              style={{ 
                background: 'linear-gradient(135deg, rgba(109, 177, 162, 0.15), rgba(196, 122, 58, 0.15))',
                borderColor: 'rgba(109, 177, 162, 0.3)'
              }}
            >
              <CardContent className="p-6 md:p-8">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">🧪</div>
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
                  Advanced Testing
                </h3>
                <p className="text-sm md:text-base" style={{ color: '#9DBFB7' }}>
                  Comprehensive tests with SonarCloud
                </p>
              </CardContent>
            </Card>

            {/* View All Repositories */}
            <Card 
              gradient
              hoverable
              className="group cursor-pointer transition-all"
              onClick={() => navigate("/repositories")}
              style={{ 
                background: 'linear-gradient(135deg, rgba(196, 122, 58, 0.15), rgba(109, 177, 162, 0.15))',
                borderColor: 'rgba(196, 122, 58, 0.3)'
              }}
            >
              <CardContent className="p-6 md:p-8">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">📦</div>
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
                  Your Repositories
                </h3>
                <p className="text-sm md:text-base" style={{ color: '#9DBFB7' }}>
                  View all your connected repositories
                </p>
              </CardContent>
            </Card>
          </Grid>
        </div>

        {/* Stats Summary Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: '#E8F1EE' }}>Summary Statistics</h2>
          <Grid columns={1} gap={4} className="sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <MetricCard 
              icon="📈" 
              label="Reviews This Week" 
              value={stats?.thisWeek || "0"}
              variant="default"
            />
            <MetricCard 
              icon="⚙️" 
              label="Avg Issues Per Review" 
              value={stats?.avgIssues || "0"}
              variant="default"
            />
            <MetricCard 
              icon="✅" 
              label="Total Users" 
              value={stats?.totalUsers || "0"}
              variant="success"
            />
          </Grid>
        </div>

        {/* Recent Reviews Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: '#E8F1EE' }}>Recent Reviews</h2>
          
          {stats?.recentReviews && stats.recentReviews.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y" style={{ borderColor: 'rgba(196, 122, 58, 0.1)' }}>
                  {stats.recentReviews.map((review, idx) => (
                    <div
                      key={review.id || idx}
                      className="p-4 md:p-6 hover:bg-opacity-50 transition-all cursor-pointer group"
                      style={{ backgroundColor: 'rgba(23, 48, 42, 0.3)' }}
                      onClick={() => navigate(`/reviews/${review.id}`)}
                    >
                      <Flex justify="between" align="start" gap={3} className="mb-3 md:mb-4 flex-col sm:flex-row">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold group-hover:translate-x-1 transition-transform" style={{ color: '#E8F1EE' }}>
                            {review.owner}/{review.repository}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: '#9DBFB7' }}>
                            {review.prNumber
                              ? `Pull Request #${review.prNumber}`
                              : "Commit Review"}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            review.severity === "high" ? "error" :
                            review.severity === "medium" ? "warning" :
                            "success"
                          }
                        >
                          {review.severity} severity
                        </Badge>
                      </Flex>
                      
                      <Flex gap={4} className="text-xs md:text-sm flex-wrap">
                        <span style={{ color: '#9DBFB7' }}>
                          📋 {review.issueCount} issue{review.issueCount !== 1 ? "s" : ""} found
                        </span>
                        <span style={{ color: '#6DB1A2' }}>
                          🕐 {review.date}
                        </span>
                      </Flex>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 md:py-16 text-center px-4">
                <div className="text-5xl md:text-6xl mb-4">📋</div>
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
                  No Recent Reviews
                </h3>
                <p className="mb-6 text-sm md:text-base" style={{ color: '#9DBFB7' }}>
                  Start by analyzing a repository to see reviews here
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate("/repositories")}
                >
                  Browse Repositories
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Advanced Testing History */}
        <div>
          <Flex justify="between" align="center" className="mb-4 md:mb-6 flex-col sm:flex-row gap-3">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#E8F1EE' }}>
              Advanced Testing History
            </h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate("/advanced-testing")}
            >
              View All Tests
            </Button>
          </Flex>
          
          {testHistory && testHistory.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y" style={{ borderColor: 'rgba(196, 122, 58, 0.1)' }}>
                  {testHistory.slice(0, 5).map((test, idx) => (
                    <div
                      key={test._id || idx}
                      className="p-4 md:p-6 hover:bg-opacity-50 transition-all cursor-pointer group"
                      style={{ backgroundColor: 'rgba(23, 48, 42, 0.3)' }}
                      onClick={() => navigate(`/advanced-testing-results/${test.owner}/${test.repo}/${test._id}`)}
                    >
                      <Flex justify="between" align="start" gap={3} className="mb-3 md:mb-4 flex-col sm:flex-row">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold group-hover:translate-x-1 transition-transform" style={{ color: '#E8F1EE' }}>
                            {test.owner}/{test.repo}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: '#9DBFB7' }}>
                            {test.testType || 'AI-Powered Test'}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            test.status === "COMPLETED" ? "success" :
                            test.status === "ERROR" ? "error" :
                            "default"
                          }
                        >
                          {test.status || 'COMPLETED'}
                        </Badge>
                      </Flex>
                      
                      <Flex gap={4} className="text-xs md:text-sm flex-wrap">
                        {test.results && test.results.score !== undefined && (
                          <span style={{ color: '#9DBFB7' }}>
                            📊 Score: {test.results.score}%
                          </span>
                        )}
                        {test.results && test.results.issuesFound !== undefined && (
                          <span style={{ color: '#9DBFB7' }}>
                            🔍 {test.results.issuesFound} issue{test.results.issuesFound !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span style={{ color: '#6DB1A2' }}>
                          🕐 {new Date(test.createdAt || test.timestamp || Date.now()).toLocaleString()}
                        </span>
                      </Flex>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 md:py-16 text-center px-4">
                <div className="text-5xl md:text-6xl mb-4">🧪</div>
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#E8F1EE' }}>
                  No Advanced Tests Yet
                </h3>
                <p className="mb-6 text-sm md:text-base" style={{ color: '#9DBFB7' }}>
                  Run AI-powered tests to see results here
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate("/advanced-testing")}
                >
                  Run Advanced Tests
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
        `}</style>
      </Container>
    </Layout>
  );
}
