import Testing from "../models/Testing.js";
import { getESLintSummary } from "../utils/eslintService.js";
import { getStylelintSummary } from "../utils/stylelintService.js";
import { getHTMLHintSummary } from "../utils/htmlhintService.js";
import { getPrettierSummary } from "../utils/prettierService.js";
import { getMarkdownlintSummary } from "../utils/markdownlintService.js";
import { getNpmAuditSummary } from "../utils/npmAuditService.js";
import { getDepcheckSummary } from "../utils/depcheckService.js";

/**
 * 🎯 RUN GITHUB CODE SCANNING TEST
 */
export const runGitHubCodeScanningTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available",
      });
    }

    console.log(
      `🔒 Running GitHub Code Scanning test for ${owner}/${repo}`
    );

    // Get GitHub code scanning results
    const scanResults = await getCodeScanningSummary(
      req.user.githubAccessToken,
      owner,
      repo
    );

    // Save to database
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: scanResults.score,
      grade: calculateGrade(scanResults.score),
      testType: "github-code-scanning",
      results: {
        githubCodeScanning: scanResults,
      },
    });

    console.log(
      `✅ GitHub Code Scanning test completed with score: ${scanResults.score}`
    );

    res.status(201).json({
      message: "GitHub Code Scanning test completed",
      testing,
    });
  } catch (error) {
    console.error("GitHub Code Scanning test error:", error);
    res.status(500).json({
      message: "Failed to run GitHub Code Scanning test",
      error: error.message,
    });
  }
};

/**
 * 🎯 RUN SONARCLOUD TEST
 */
export const runSonarCloudTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`🔍 Running SonarCloud analysis for ${owner}/${repo}`);

    // Get SonarCloud analysis
    const sonarResults = await getProjectSummary(owner, repo);

    // Save to database
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: sonarResults.score,
      grade: calculateGrade(sonarResults.score),
      testType: "sonarcloud",
      results: {
        sonarcloud: sonarResults,
      },
    });

    console.log(`✅ SonarCloud test completed with score: ${sonarResults.score}`);

    res.status(201).json({
      message: "SonarCloud test completed",
      testing,
    });
  } catch (error) {
    console.error("SonarCloud test error:", error);
    res.status(500).json({
      message: "Failed to run SonarCloud test",
      error: error.message,
    });
  }
};

/**
 * 🎯 RUN CODACY TEST
 */
export const runCodacyTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`🎨 Running Codacy analysis for ${owner}/${repo}`);

    // Get Codacy analysis (gracefully handle failures)
    let codacyResults;
    try {
      codacyResults = await getCodacySummary(owner, repo);
    } catch (err) {
      codacyResults = {
        status: "ERROR",
        message: err.message,
      };
    }

    const codacyScore = codacyResults?.analysis?.score ?? 0;

    // Save to database
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: codacyScore,
      grade: calculateGrade(codacyScore),
      testType: "codacy",
      results: {
        codacy: codacyResults,
      },
    });

    console.log(`✅ Codacy test completed with score: ${codacyScore}`);

    res.status(201).json({
      message: "Codacy test completed",
      testing,
    });
  } catch (error) {
    console.error("Codacy test error:", error);
    res.status(500).json({
      message: "Failed to run Codacy test",
      error: error.message,
    });
  }
};

/**
 * 🎯 RUN MULTIPLE TESTS
 */
export const runMultipleTests = async (req, res) => {
  try {
    const { owner, repo, testTypes } = req.body;

    if (!owner || !repo || !testTypes || testTypes.length === 0) {
      return res.status(400).json({
        message:
          "Owner, repo, and testTypes array are required",
      });
    }

    console.log(`🧪 Running tests: ${testTypes.join(", ")} for ${owner}/${repo}`);

    const results = {};

    // Run Prettier if selected
    if (testTypes.includes("prettier")) {
      try {
        const prettierResult = await getPrettierSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (prettierResult.success) {
          results.prettier = {
            score: prettierResult.score,
            grade: prettierResult.grade,
            ...prettierResult.details
          };
        } else {
          results.prettier = {
            status: "ERROR",
            score: 0,
            message: prettierResult.message || prettierResult.error,
          };
        }
      } catch (err) {
        console.error("Prettier error:", err.message);
        results.prettier = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run Markdownlint if selected
    if (testTypes.includes("markdownlint")) {
      try {
        const mdResult = await getMarkdownlintSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (mdResult.success) {
          results.markdownlint = {
            score: mdResult.score,
            grade: mdResult.grade,
            ...mdResult.details
          };
        } else {
          results.markdownlint = {
            status: "ERROR",
            score: 0,
            message: mdResult.message || mdResult.error,
          };
        }
      } catch (err) {
        console.error("Markdownlint error:", err.message);
        results.markdownlint = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run npm audit if selected
    if (testTypes.includes("npm-audit")) {
      try {
        const auditResult = await getNpmAuditSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (auditResult.success) {
          results["npm-audit"] = {
            score: auditResult.score,
            grade: auditResult.grade,
            ...auditResult.details
          };
        } else {
          results["npm-audit"] = {
            status: "ERROR",
            score: 0,
            message: auditResult.message || auditResult.error,
          };
        }
      } catch (err) {
        console.error("npm audit error:", err.message);
        results["npm-audit"] = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run depcheck if selected
    if (testTypes.includes("depcheck")) {
      try {
        const depResult = await getDepcheckSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (depResult.success) {
          results.depcheck = {
            score: depResult.score,
            grade: depResult.grade,
            ...depResult.details
          };
        } else {
          results.depcheck = {
            status: "ERROR",
            score: 0,
            message: depResult.message || depResult.error,
          };
        }
      } catch (err) {
        console.error("depcheck error:", err.message);
        results.depcheck = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run ESLint if selected
    if (testTypes.includes("eslint")) {
      try {
        const eslintResult = await getESLintSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (eslintResult.success) {
          results.eslint = {
            ...eslintResult.details,
            score: eslintResult.score,
            grade: eslintResult.grade
          };
        } else {
          results.eslint = {
            status: "ERROR",
            score: 0,
            message: eslintResult.message || eslintResult.error,
          };
        }
      } catch (err) {
        console.error("ESLint error:", err.message);
        results.eslint = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run Stylelint if selected
    if (testTypes.includes("stylelint")) {
      try {
        const stylelintResult = await getStylelintSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (stylelintResult.success) {
          results.stylelint = {
            score: stylelintResult.score,
            grade: stylelintResult.grade,
            ...stylelintResult.details
          };
        } else {
          results.stylelint = {
            status: "ERROR",
            score: 0,
            message: stylelintResult.message || stylelintResult.error,
          };
        }
      } catch (err) {
        console.error("Stylelint error:", err.message);
        results.stylelint = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Run HTMLHint if selected
    if (testTypes.includes("htmlhint")) {
      try {
        const htmlhintResult = await getHTMLHintSummary(
          owner,
          repo,
          req.user.githubAccessToken
        );
        if (htmlhintResult.success) {
          results.htmlhint = {
            score: htmlhintResult.score,
            grade: htmlhintResult.grade,
            ...htmlhintResult.details
          };
        } else {
          results.htmlhint = {
            status: "ERROR",
            score: 0,
            message: htmlhintResult.message || htmlhintResult.error,
          };
        }
      } catch (err) {
        console.error("HTMLHint error:", err.message);
        results.htmlhint = {
          status: "ERROR",
          score: 0,
          message: err.message,
        };
      }
    }

    // Calculate overall score (average of all tests)
    const scores = Object.values(results)
      .filter((r) => r.score !== undefined)
      .map((r) => r.score);

    const overallScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

    // Save to database
    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore,
      grade: calculateGrade(overallScore),
      testType: testTypes.join(","),
      results,
    });

    console.log(`✅ All tests completed with score: ${overallScore}`);

    res.status(201).json({
      message: "Tests completed successfully",
      testing,
    });
  } catch (error) {
    console.error("Multiple tests error:", error);
    res.status(500).json({
      message: "Failed to run tests",
      error: error.message,
    });
  }
};

/**
 * Calculate letter grade from score
 */
function calculateGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

/**
 * 📋 LIST AVAILABLE TESTS
 */
export const listAvailableTests = async (req, res) => {
  res.json({
    availableTests: [
      {
        id: "eslint",
        name: "ESLint Analysis",
        description:
          "JavaScript/React code quality and accessibility testing (no API key needed)",
        icon: "📝",
        features: [
          "Code Quality Issues",
          "Accessibility (A11y) Checks",
          "React Best Practices",
          "ESLint Rules",
          "Instant Analysis",
        ],
        status: "available",
        note: "Works on all JS/JSX/TS/TSX files",
      },
      {
        id: "stylelint",
        name: "Stylelint CSS Analysis",
        description:
          "CSS/SCSS quality and standards validation (no API key needed)",
        icon: "🎨",
        features: [
          "CSS Standards",
          "Style Issues",
          "Best Practices",
          "Color & Typography",
          "Instant Analysis",
        ],
        status: "available",
        note: "Works on all CSS/SCSS files",
      },
      {
        id: "htmlhint",
        name: "HTMLHint Validation",
        description:
          "HTML structure and accessibility validation (no API key needed)",
        icon: "📄",
        features: [
          "HTML Validation",
          "Structure Issues",
          "Accessibility Checks",
          "Best Practices",
          "Instant Analysis",
        ],
        status: "available",
        note: "Works on all HTML files",
      },
      {
        id: "prettier",
        name: "Prettier Format Check",
        description: "Formatting consistency across code and docs",
        icon: "🎯",
        features: [
          "Format Consistency",
          "Multi-language",
          "Fast Checks",
        ],
        status: "available",
        note: "Checks JS/TS/JSON/CSS/HTML/MD/YAML",
      },
      {
        id: "markdownlint",
        name: "Markdownlint",
        description: "Markdown quality and style checks",
        icon: "🧾",
        features: [
          "Docs Quality",
          "Style Rules",
          "Fast Checks",
        ],
        status: "available",
        note: "Checks .md files",
      },
      {
        id: "npm-audit",
        name: "npm Audit",
        description: "Dependency vulnerability scan (package-lock.json)",
        icon: "🛡️",
        features: [
          "Vulnerability Scan",
          "Severity Breakdown",
          "Fast Checks",
        ],
        status: "available",
        note: "Requires package-lock.json",
      },
      {
        id: "depcheck",
        name: "Depcheck",
        description: "Unused and missing dependency detection",
        icon: "📦",
        features: [
          "Unused Dependencies",
          "Missing Dependencies",
          "Fast Checks",
        ],
        status: "available",
        note: "Requires package.json",
      },
    ],
  });
};

/**
 * 🔍 GET SONARCLOUD PROJECT INFO
 */
export const getSonarCloudProjectInfo = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log(`🔍 Checking SonarCloud project for ${owner}/${repo}`);

    const projectInfo = await getProjectSummary(owner, repo);

    res.json({
      available: projectInfo.status === "ANALYZED",
      projectInfo,
    });
  } catch (error) {
    console.error("Get project info error:", error);
    res.status(500).json({
      message: "Failed to get project info",
      error: error.message,
    });
  }
};

/**
 * 📝 RUN ESLINT TEST (JavaScript/React Code Quality & Accessibility)
 */
export const runESLintTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available",
      });
    }

    console.log(`📝 Running ESLint test for ${owner}/${repo}`);

    const eslintResults = await getESLintSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!eslintResults.success) {
      return res.status(400).json({
        message: eslintResults.message || eslintResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: eslintResults.score,
      grade: eslintResults.grade,
      testType: "eslint",
      results: {
        eslint: eslintResults.details,
      },
    });

    console.log(`✅ ESLint test completed with score: ${eslintResults.score}`);

    res.status(201).json({
      message: "ESLint test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("ESLint test error:", error);
    res.status(500).json({
      message: "Failed to run ESLint test",
      error: error.message,
    });
  }
};

/**
 * 🎨 RUN STYLELINT TEST (CSS/SCSS Quality)
 */
export const runStylelintTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available",
      });
    }

    console.log(`🎨 Running Stylelint test for ${owner}/${repo}`);

    const stylelintResults = await getStylelintSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!stylelintResults.success) {
      return res.status(400).json({
        message: stylelintResults.message || stylelintResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: stylelintResults.score,
      grade: stylelintResults.grade,
      testType: "stylelint",
      results: {
        stylelint: stylelintResults.details,
      },
    });

    console.log(`✅ Stylelint test completed with score: ${stylelintResults.score}`);

    res.status(201).json({
      message: "Stylelint test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("Stylelint test error:", error);
    res.status(500).json({
      message: "Failed to run Stylelint test",
      error: error.message,
    });
  }
};

/**
 * 📄 RUN HTMLHINT TEST (HTML Validation)
 */
export const runHTMLHintTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available",
      });
    }

    console.log(`📄 Running HTMLHint test for ${owner}/${repo}`);

    const htmlhintResults = await getHTMLHintSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!htmlhintResults.success) {
      return res.status(400).json({
        message: htmlhintResults.message || htmlhintResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: htmlhintResults.score,
      grade: htmlhintResults.grade,
      testType: "htmlhint",
      results: {
        htmlhint: htmlhintResults.details,
      },
    });

    console.log(`✅ HTMLHint test completed with score: ${htmlhintResults.score}`);

    res.status(201).json({
      message: "HTMLHint test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("HTMLHint test error:", error);
    res.status(500).json({
      message: "Failed to run HTMLHint test",
      error: error.message,
    });
  }
};

/**
 * 🎯 RUN PRETTIER TEST (Formatting Consistency)
 */
export const runPrettierTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`🎯 Running Prettier test for ${owner}/${repo}`);

    const prettierResults = await getPrettierSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!prettierResults.success) {
      return res.status(400).json({
        message: prettierResults.message || prettierResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: prettierResults.score,
      grade: prettierResults.grade,
      testType: "prettier",
      results: {
        prettier: prettierResults.details,
      },
    });

    console.log(`✅ Prettier test completed with score: ${prettierResults.score}`);

    res.status(201).json({
      message: "Prettier test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("Prettier test error:", error);
    res.status(500).json({
      message: "Failed to run Prettier test",
      error: error.message,
    });
  }
};

/**
 * 🧾 RUN MARKDOWNLINT TEST (Docs Quality)
 */
export const runMarkdownlintTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`🧾 Running Markdownlint test for ${owner}/${repo}`);

    const mdResults = await getMarkdownlintSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!mdResults.success) {
      return res.status(400).json({
        message: mdResults.message || mdResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: mdResults.score,
      grade: mdResults.grade,
      testType: "markdownlint",
      results: {
        markdownlint: mdResults.details,
      },
    });

    console.log(`✅ Markdownlint test completed with score: ${mdResults.score}`);

    res.status(201).json({
      message: "Markdownlint test completed successfully",
      testing,
    });
  } catch (error) {
    console.error("Markdownlint test error:", error);
    res.status(500).json({
      message: "Failed to run Markdownlint test",
      error: error.message,
    });
  }
};

/**
 * 🛡️ RUN NPM AUDIT TEST (Dependency Vulnerabilities)
 */
export const runNpmAuditTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`🛡️ Running npm audit for ${owner}/${repo}`);

    const auditResults = await getNpmAuditSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!auditResults.success) {
      return res.status(400).json({
        message: auditResults.message || auditResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: auditResults.score,
      grade: auditResults.grade,
      testType: "npm-audit",
      results: {
        "npm-audit": auditResults.details,
      },
    });

    console.log(`✅ npm audit completed with score: ${auditResults.score}`);

    res.status(201).json({
      message: "npm audit completed successfully",
      testing,
    });
  } catch (error) {
    console.error("npm audit test error:", error);
    res.status(500).json({
      message: "Failed to run npm audit",
      error: error.message,
    });
  }
};

/**
 * 📦 RUN DEPCHECK TEST (Unused/Missing Dependencies)
 */
export const runDepcheckTest = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        message: "Owner and repo are required",
      });
    }

    console.log(`📦 Running depcheck for ${owner}/${repo}`);

    const depResults = await getDepcheckSummary(
      owner,
      repo,
      req.user.githubAccessToken
    );

    if (!depResults.success) {
      return res.status(400).json({
        message: depResults.message || depResults.error,
      });
    }

    const testing = await Testing.create({
      user: req.user._id,
      owner,
      repo,
      overallScore: depResults.score,
      grade: depResults.grade,
      testType: "depcheck",
      results: {
        depcheck: depResults.details,
      },
    });

    console.log(`✅ depcheck completed with score: ${depResults.score}`);

    res.status(201).json({
      message: "depcheck completed successfully",
      testing,
    });
  } catch (error) {
    console.error("depcheck test error:", error);
    res.status(500).json({
      message: "Failed to run depcheck",
      error: error.message,
    });
  }
};
