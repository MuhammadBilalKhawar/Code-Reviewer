import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Select, Spinner } from "../components/ui";

export default function AdvancedTesting() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

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
      // Get all tests for the user (no owner/repo filter)
      const res = await api.get("/api/testing/history");
      setTestHistory(res.data.tests || res.data || []);
    } catch (err) {
      console.error("Failed to fetch test history", err);
    }
  };

  const testDetails = {
    'dynamic-eslint': {
      name: 'ESLint Analysis',
      description: 'AI-powered syntax and style checking',
      features: ['Detects syntax errors', 'Finds unused variables', 'Enforces code style', 'Identifies anti-patterns']
    },
    'dynamic-prettier': {
      name: 'Prettier Formatting',
      description: 'Automated code formatting analysis',
      features: ['Checks formatting consistency', 'Detects indentation issues', 'Validates line length', 'Ensures code readability']
    },
    'dynamic-jest': {
      name: 'Jest Test Generation',
      description: 'AI generates and analyzes test coverage',
      features: ['Generates unit tests', 'Analyzes test coverage', 'Suggests edge cases', 'Validates test quality']
    },
    'dynamic-security': {
      name: 'Security Scan',
      description: 'Comprehensive security vulnerability detection',
      features: ['Finds hardcoded credentials', 'Detects SQL injection', 'Identifies XSS vulnerabilities', 'Checks insecure dependencies']
    },
    'dynamic-performance': {
      name: 'Performance Analysis',
      description: 'Code efficiency and optimization',
      features: ['Finds inefficient algorithms', 'Detects memory leaks', 'Identifies bottlenecks', 'Suggests optimizations']
    },
    'dynamic-accessibility': {
      name: 'Accessibility Check',
      description: 'WCAG compliance validation',
      features: ['Validates ARIA labels', 'Checks keyboard navigation', 'Ensures color contrast', 'Verifies screen reader support']
    }
  };

  const tests = useMemo(
    () =>
      availableTests.map((t) => {
        const testId = typeof t === "string" ? t : (t.id || t.type || t.name);
        const details = testDetails[testId] || {};
        return {
          id: testId,
          name: details.name || testId,
          description: details.description || '',
          features: details.features || []
        };
      }),
    [availableTests]
  );

  const toggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((t) => t !== testId) : [...prev, testId]
    );
  };

  const handleRunTests = async () => {
    if (!selectedRepo || selectedTests.length === 0) return;

    try {
      setTestRunning(true);
      const [owner, repo] = selectedRepo.split("/");

      if (selectedTests.length === 1) {
        // Single test - navigate directly to result
        const testType = selectedTests[0];
        const response = await api.post("/api/testing/dynamic", { owner, repo, testType });
        const testId = response.data.testing?._id || response.data.testId;
        
        if (!testId) throw new Error("No test ID returned from server");
        
        navigate(`/advanced-testing-results/${owner}/${repo}/${testId}`);
      } else {
        // Multiple tests - run all and show progress
        const testResults = [];
        setTotalTests(selectedTests.length);
        
        for (let i = 0; i < selectedTests.length; i++) {
          const testType = selectedTests[i];
          setCurrentTest(i + 1);
          
          try {
            console.log(`Running test ${i + 1}/${selectedTests.length}: ${testType}`);
            const res = await api.post("/api/testing/dynamic", { owner, repo, testType });
            testResults.push({
              testType,
              success: true,
              data: res.data
            });
          } catch (err) {
            console.error(`Failed to run ${testType}:`, err);
            testResults.push({
              testType,
              success: false,
              error: err.message
            });
          }
        }
        
        // Show success message with all test results
        const successCount = testResults.filter(r => r.success).length;
        const failCount = testResults.length - successCount;
        
        const message = `✅ Completed ${successCount}/${testResults.length} tests successfully${failCount > 0 ? `\n❌ ${failCount} failed` : ''}`;
        alert(message);
        
        // Refresh history to show all new results
        fetchTestHistory();
        
        // Navigate to results page with all test IDs
        const testIds = testResults
          .filter(r => r.success)
          .map(r => r.data.testing?._id || r.data.testId)
          .filter(id => id);
        
        if (testIds.length > 0) {
          // Pass all test IDs as comma-separated string
          navigate(`/advanced-testing-results/${owner}/${repo}/${testIds.join(',')}`);
        }
      }
    } catch (err) {
      console.error("Failed to run tests", err);
      alert("Failed to run tests. " + (err.response?.data?.message || err.message));
    } finally {
      setTestRunning(false);
      setCurrentTest(0);
      setTotalTests(0);
    }
  };

  return (
    <Layout>
      <Container className="py-6 md:py-12 px-4">
        <Flex justify="between" align="start" className="mb-6 md:mb-10 flex-col sm:flex-row gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#E8F1EE" }}>
              Advanced Testing
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#9DBFB7" }}>
              Select a repository and run targeted quality checks
            </p>
          </div>
          <Button
            variant="accent"
            className="w-full sm:w-auto"
            onClick={handleRunTests}
            disabled={testRunning || !selectedRepo || selectedTests.length === 0}
          >
            {testRunning 
              ? (totalTests > 1 ? `Running ${currentTest}/${totalTests} tests...` : "Running...") 
              : `Run Selected Tests${selectedTests.length > 1 ? ` (${selectedTests.length})` : ''}`
            }
          </Button>
        </Flex>

        {/* Repository Selection and Test Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Repository Selection */}
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: "#E8F1EE" }}>
                Repository Selection
              </h2>
              <Select
                label="Select Repository"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                options={repos.map((repo) => ({
                  value: `${repo.owner.login}/${repo.name}`,
                  label: `${repo.owner.login}/${repo.name}`,
                }))}
              />
            </CardContent>
          </Card>

          {/* Test Selection */}
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: "#E8F1EE" }}>
                Testing Options
              </h2>
              <p className="text-xs md:text-sm mb-4" style={{ color: "#C47A3A" }}>
                Select tests to run (AI-powered analysis)
              </p>
              <div className="space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                {tests.map((test) => (
                  <label key={test.id} className="flex items-start gap-2 md:gap-3 cursor-pointer p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => toggleTest(test.id)}
                      className="mt-1 accent-copper"
                    />
                    <div className="flex-1">
                      <span className="block font-semibold text-sm md:text-base" style={{ color: "#E8F1EE" }}>{test.name}</span>
                      {test.description && (
                        <span className="block text-xs md:text-sm mt-1" style={{ color: "#9DBFB7" }}>{test.description}</span>
                      )}
                      {test.features && test.features.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                          {test.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] md:text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <Card>
          <CardContent className="p-5 md:p-6">
            <Flex justify="between" align="center" className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold" style={{ color: "#E8F1EE" }}>
                Recent Test History
              </h2>
            </Flex>
            {loading ? (
              <Flex direction="col" align="center" className="py-10">
                <Spinner size="lg" />
                <p className="mt-3" style={{ color: "#9DBFB7" }}>Loading history...</p>
              </Flex>
            ) : testHistory.length > 0 ? (
              <>
                <div className="space-y-3">
                  {(showAllHistory ? testHistory : testHistory.slice(0, 3)).map((test) => (
                    <Card key={test._id || test.id} className="border border-copper/15">
                      <CardContent className="p-3 md:p-4">
                        <Flex justify="between" align="start" className="flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm md:text-base" style={{ color: "#E8F1EE" }}>
                              {test.owner}/{test.repo}
                            </p>
                            <Flex gap={2} align="center" className="mt-1 flex-wrap">
                              <Badge variant={test.status === 'COMPLETED' ? 'success' : test.status === 'ERROR' ? 'danger' : 'default'}>
                                {test.status || 'COMPLETED'}
                              </Badge>
                              <span className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                                {test.testType || 'Unknown Test'}
                              </span>
                              <span className="text-xs md:text-sm" style={{ color: "#9DBFB7" }}>
                                • {new Date(test.createdAt || test.timestamp || Date.now()).toLocaleString()}
                              </span>
                            </Flex>
                          </div>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => navigate(`/advanced-testing-results/${test.owner}/${test.repo}/${test._id}`)}
                          >
                            View Results
                          </Button>
                        </Flex>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {testHistory.length > 3 && (
                  <Flex justify="center" className="mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory ? "Show Less" : `Show More (${testHistory.length - 3} more)`}
                    </Button>
                  </Flex>
                )}
              </>
            ) : (
              <p style={{ color: "#9DBFB7" }}>No tests have been run yet.</p>
            )}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}
