import Testing from "../models/Testing.js";
import { runDynamicTest, commitWorkflowToGitHub } from "../utils/dynamicTestingService.js";

/**
 * Run AI-powered dynamic test locally
 * Analyzes code and returns results with optional workflow for commit
 */
export const runDynamicAITest = async (req, res) => {
  try {
    const { owner, repo, testType } = req.body;

    if (!owner || !repo || !testType) {
      return res.status(400).json({
        message: "Owner, repo, and testType are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub authentication required",
      });
    }

    console.log(`🤖 Running dynamic ${testType} test for ${owner}/${repo}`);

    // Extract the actual test name (remove "dynamic-" prefix)
    const actualTestType = testType.replace("dynamic-", "");

    const result = await runDynamicTest(
      req.user.githubAccessToken,
      owner,
      repo,
      actualTestType
    );

    if (!result.success) {
      const testing = await Testing.create({
        user: req.user._id,
        owner,
        repo,
        overallScore: 0,
        grade: "F",
        testType: `dynamic-${actualTestType}`,
        status: "ERROR",
        results: {
          [`dynamic-${actualTestType}`]: {
            error: result.error,
            message: "Failed to run dynamic test",
          },
        },
      });

      return res.status(201).json({
        message: "Dynamic test failed",
        testing,
      });
    }

    // Test completed locally
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: result.score,
      grade: result.grade,
      testType: `dynamic-${actualTestType}`,
      status: "COMPLETED",
      results: {
        [`dynamic-${actualTestType}`]: {
          conclusion: result.conclusion,
          score: result.score,
          grade: result.grade,
          analysis: result.analysis,
          details: result.details,
          yaml: result.yaml,
          workflowName: result.workflowName,
          defaultBranch: result.defaultBranch,
          canCommit: result.canCommit,
        },
      },
    });

    console.log(`✅ Dynamic test completed locally with score: ${result.score}`);

    res.status(201).json({
      message: "Dynamic test completed",
      testing,
    });
  } catch (error) {
    console.error("Dynamic test error:", error);
    res.status(500).json({
      message: "Failed to run dynamic test",
      error: error.message,
    });
  }
};

/**
 * List all available AI-powered tests
 */
export const listAvailableTests = async (req, res) => {
  res.json({
    availableTests: [
      {
        id: "dynamic-eslint",
        name: "🤖 AI ESLint Analysis",
        description:
          "AI generates custom ESLint workflow, runs tests in GitHub Actions, and provides intelligent analysis",
        icon: "🤖",
        features: [
          "AI-Generated Workflow",
          "Real GitHub Actions Environment",
          "Intelligent Error Analysis",
          "Automatic Code Quality Checks",
          "No Manual Setup Required",
        ],
        status: "available",
        note: "Runs in GitHub Actions with AI-powered analysis",
      },
      {
        id: "dynamic-prettier",
        name: "🤖 AI Code Formatting",
        description:
          "AI creates Prettier workflow to check code formatting consistency",
        icon: "🎯",
        features: [
          "AI-Generated Prettier Workflow",
          "Format Consistency Checks",
          "Multi-Language Support",
          "Detailed Format Reports",
          "GitHub Actions Integration",
        ],
        status: "available",
        note: "Automated formatting validation",
      },
      {
        id: "dynamic-jest",
        name: "🤖 AI Unit Testing",
        description:
          "AI generates Jest test workflows and analyzes test coverage",
        icon: "🧪",
        features: [
          "Auto-Generated Test Suites",
          "Coverage Analysis",
          "Integration Testing",
          "AI Test Insights",
          "Real Test Execution",
        ],
        status: "available",
        note: "Comprehensive automated testing",
      },
      {
        id: "dynamic-security",
        name: "🤖 AI Security Audit",
        description:
          "AI creates security scanning workflow to detect vulnerabilities",
        icon: "🔒",
        features: [
          "Dependency Scanning",
          "Vulnerability Detection",
          "Security Best Practices",
          "AI Risk Analysis",
          "Automated Patching Suggestions",
        ],
        status: "available",
        note: "Comprehensive security analysis",
      },
      {
        id: "dynamic-performance",
        name: "🤖 AI Performance Testing",
        description:
          "AI generates performance testing workflow and analyzes bottlenecks",
        icon: "⚡",
        features: [
          "Load Testing",
          "Performance Benchmarks",
          "Bottleneck Detection",
          "AI Optimization Tips",
          "Memory Analysis",
        ],
        status: "available",
        note: "Performance optimization insights",
      },
      {
        id: "dynamic-accessibility",
        name: "🤖 AI Accessibility Check",
        description:
          "AI creates accessibility testing workflow for WCAG compliance",
        icon: "♿",
        features: [
          "WCAG Compliance",
          "Accessibility Issues",
          "Screen Reader Testing",
          "AI Remediation Suggestions",
          "Inclusive Design Tips",
        ],
        status: "available",
        note: "Accessibility compliance testing",
      },
    ],
  });
};

/**
 * Get all test runs for current user
 */
export const getAllTests = async (req, res) => {
  try {
    const tests = await Testing.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      tests,
      count: tests.length,
    });
  } catch (error) {
    console.error("Get all tests error:", error);
    res.status(500).json({
      message: "Failed to fetch tests",
      error: error.message,
    });
  }
};

/**
 * Get test statistics for current user
 */
export const getTestStats = async (req, res) => {
  try {
    const totalTests = await Testing.countDocuments({ user: req.user._id });
    const completedTests = await Testing.countDocuments({
      user: req.user._id,
      status: "COMPLETED",
    });
    const errorTests = await Testing.countDocuments({
      user: req.user._id,
      status: "ERROR",
    });
    const runningTests = await Testing.countDocuments({
      user: req.user._id,
      status: "RUNNING",
    });

    const recentTests = await Testing.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTests,
      completedTests,
      errorTests,
      runningTests,
      recentTests,
    });
  } catch (error) {
    console.error("Get test stats error:", error);
    res.status(500).json({
      message: "Failed to fetch test statistics",
      error: error.message,
    });
  }
};

/**
 * Get specific test result by ID
 */
export const getTestById = async (req, res) => {
  try {
    const test = await Testing.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    res.json(test);
  } catch (error) {
    console.error("Get test by ID error:", error);
    res.status(500).json({
      message: "Failed to fetch test",
      error: error.message,
    });
  }
};

/**
 * Delete test result
 */
export const deleteTest = async (req, res) => {
  try {
    const test = await Testing.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    res.json({
      message: "Test deleted successfully",
      test,
    });
  } catch (error) {
    console.error("Delete test error:", error);
    res.status(500).json({
      message: "Failed to delete test",
      error: error.message,
    });
  }
};

/**
 * Get test history for specific repository
 */
export const getTestHistory = async (req, res) => {
  try {
    const { owner, repo } = req.query;

    // Build query - if owner/repo provided, filter by them, otherwise return all
    const query = { user: req.user._id };
    if (owner && repo) {
      query.owner = owner;
      query.repo = repo;
    }

    const tests = await Testing.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      tests,
      count: tests.length,
    });
  } catch (error) {
    console.error("Get test history error:", error);
    res.status(500).json({
      message: "Failed to fetch test history",
      error: error.message,
    });
  }
};

/**
 * Commit workflow to GitHub after user approval
 * Allows user to save workflow to .github/workflows/ directory
 */
export const commitTestWorkflow = async (req, res) => {
  try {
    const { owner, repo, workflowName, yaml, defaultBranch } = req.body;

    if (!owner || !repo || !workflowName || !yaml) {
      return res.status(400).json({
        message: "Owner, repo, workflowName, and yaml are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub authentication required",
      });
    }

    console.log(`📤 User committing workflow ${workflowName} to ${owner}/${repo}`);

    // Get repository info to determine default branch if not provided
    let branchToUse = defaultBranch;
    if (!branchToUse) {
      try {
        const { githubApi } = await import("../utils/githubapi.js");
        const repoInfo = await githubApi(req.user.githubAccessToken, `/repos/${owner}/${repo}`);
        branchToUse = repoInfo.default_branch || "main";
        console.log(`📍 Using default branch: ${branchToUse}`);
      } catch (err) {
        console.error("Failed to get repo info:", err.message);
        branchToUse = "main"; // fallback
      }
    }

    const result = await commitWorkflowToGitHub(
      req.user.githubAccessToken,
      owner,
      repo,
      workflowName,
      yaml,
      branchToUse
    );

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to commit workflow",
        error: result.error,
      });
    }

    res.json({
      message: "Workflow committed successfully! It will run automatically on the next push.",
      path: result.path,
    });
  } catch (error) {
    console.error("Commit workflow error:", error);
    res.status(500).json({
      message: "Failed to commit workflow",
      error: error.message,
    });
  }
};

export default {
  runDynamicAITest,
  listAvailableTests,
  getAllTests,
  getTestStats,
  getTestById,
  deleteTest,
  getTestHistory,
  commitTestWorkflow,
};
