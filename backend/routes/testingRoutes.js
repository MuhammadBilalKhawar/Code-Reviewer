import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createTestRun,
  getTestResult,
  listTestRuns,
  getTestingStats,
  deleteTestResult,
} from "../controllers/testingController.js";
import {
  runESLintTest,
  runStylelintTest,
  runHTMLHintTest,
  runPrettierTest,
  runMarkdownlintTest,
  runNpmAuditTest,
  runDepcheckTest,
  runMultipleTests,
  listAvailableTests,
} from "../controllers/advancedTestingController.js";

const router = express.Router();

// Available tests list
router.get("/available", auth, listAvailableTests);

// Run ESLint test (JavaScript/React Quality)
router.post("/eslint", auth, runESLintTest);

// Run Stylelint test (CSS Quality)
router.post("/stylelint", auth, runStylelintTest);

// Run HTMLHint test (HTML Validation)
router.post("/htmlhint", auth, runHTMLHintTest);

// Run Prettier test (Formatting)
router.post("/prettier", auth, runPrettierTest);

// Run Markdownlint test (Docs)
router.post("/markdownlint", auth, runMarkdownlintTest);

// Run npm audit test (Dependencies)
router.post("/npm-audit", auth, runNpmAuditTest);

// Run depcheck test (Dependencies)
router.post("/depcheck", auth, runDepcheckTest);

// Run multiple tests
router.post("/multiple", auth, runMultipleTests);

// Custom testing (original)
router.post("/", auth, createTestRun);

// Testing statistics
router.get("/stats", auth, getTestingStats);

// List all test runs (history)
router.get("/history", auth, listTestRuns);
router.get("/list", auth, listTestRuns);

// Get single test result
router.get("/:id", auth, getTestResult);

// Delete test result
router.delete("/:id", auth, deleteTestResult);

export default router;

