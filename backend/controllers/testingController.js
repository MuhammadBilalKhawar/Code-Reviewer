import Testing from "../models/Testing.js";
import { runFullTest } from "../utils/testingService.js";

// ====================================
// 🧪 CREATE NEW TEST RUN
// ====================================
export const createTestRun = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available. Please re-authenticate.",
      });
    }

    console.log(`🧪 Running tests for ${owner}/${repo}`);

    // Run the full testing suite
    const testResults = await runFullTest(
      req.user.githubAccessToken,
      owner,
      repo
    );

    // Save to database
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: testResults.overallScore,
      grade: testResults.grade,
      results: testResults.results,
    });

    console.log(`✅ Test completed with score: ${testResults.overallScore}`);

    res.status(201).json({
      message: "Test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("Testing error:", error);
    res.status(500).json({
      message: "Failed to run tests",
      error: error.message,
    });
  }
};

// ====================================
// 📊 GET SINGLE TEST RESULT
// ====================================
export const getTestResult = async (req, res) => {
  try {
    const { id } = req.params;

    const testing = await Testing.findById(id);

    if (!testing) {
      return res.status(404).json({ message: "Test result not found" });
    }

    // Check if user owns this test
    if (testing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(testing);
  } catch (error) {
    console.error("Get test error:", error);
    res.status(500).json({
      message: "Failed to fetch test result",
      error: error.message,
    });
  }
};

// ====================================
// 📋 LIST ALL TEST RUNS
// ====================================
export const listTestRuns = async (req, res) => {
  try {
    const { owner, repo } = req.query;

    const query = { user: req.user._id };
    if (owner && repo) {
      query.owner = owner;
      query.repo = repo;
    }

    const tests = await Testing.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(tests);
  } catch (error) {
    console.error("List tests error:", error);
    res.status(500).json({
      message: "Failed to fetch test runs",
      error: error.message,
    });
  }
};

// ====================================
// 📈 GET TESTING STATISTICS
// ====================================
export const getTestingStats = async (req, res) => {
  try {
    const totalTests = await Testing.countDocuments({ user: req.user._id });

    const avgScore = await Testing.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          avgOverallScore: { $avg: "$overallScore" },
          avgCodeQuality: { $avg: "$results.codeQuality.score" },
          avgSecurity: { $avg: "$results.security.score" },
          avgTestReadiness: { $avg: "$results.testReadiness.score" },
          avgPerformance: { $avg: "$results.performance.score" },
        },
      },
    ]);

    const gradeDistribution = await Testing.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentTests = await Testing.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("owner repo overallScore grade createdAt");

    res.json({
      totalTests,
      averageScores: avgScore[0] || {
        avgOverallScore: 0,
        avgCodeQuality: 0,
        avgSecurity: 0,
        avgTestReadiness: 0,
        avgPerformance: 0,
      },
      gradeDistribution: gradeDistribution.reduce((acc, g) => {
        acc[g._id] = g.count;
        return acc;
      }, {}),
      recentTests,
    });
  } catch (error) {
    console.error("Testing stats error:", error);
    res.status(500).json({
      message: "Failed to fetch testing statistics",
      error: error.message,
    });
  }
};

// ====================================
// 🗑️ DELETE TEST RESULT
// ====================================
export const deleteTestResult = async (req, res) => {
  try {
    const { id } = req.params;

    const testing = await Testing.findById(id);

    if (!testing) {
      return res.status(404).json({ message: "Test result not found" });
    }

    // Check if user owns this test
    if (testing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Testing.findByIdAndDelete(id);

    res.json({ message: "Test result deleted successfully" });
  } catch (error) {
    console.error("Delete test error:", error);
    res.status(500).json({
      message: "Failed to delete test result",
      error: error.message,
    });
  }
};
