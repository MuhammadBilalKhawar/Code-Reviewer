import express from "express";
import { auth } from "../middleware/auth.js";
import {
  runDynamicAITest,
  listAvailableTests,
  getAllTests,
  getTestStats,
  getTestById,
  deleteTest,
  getTestHistory,
  commitTestWorkflow,
} from "../controllers/advancedTestingController.js";

const router = express.Router();

// List available AI-powered tests
router.get("/available", auth, listAvailableTests);

// Run dynamic AI test (local execution)
router.post("/dynamic", auth, runDynamicAITest);

// Commit approved workflow to GitHub
router.post("/commit-workflow", auth, commitTestWorkflow);

// Get testing statistics
router.get("/stats", auth, getTestStats);

// Get test history
router.get("/history", auth, getTestHistory);

// List all test runs
router.get("/", auth, getAllTests);

// Get single test result
router.get("/:id", auth, getTestById);

// Delete test result
router.delete("/:id", auth, deleteTest);

export default router;
