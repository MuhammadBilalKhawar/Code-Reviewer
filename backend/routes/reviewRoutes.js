import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createReview,
  getReview,
  listReviews,
  createCommitReview,
  getStatistics,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", auth, createReview);
router.post("/commit", auth, createCommitReview);
router.get("/stats", auth, getStatistics);
router.get("/", auth, listReviews);
router.get("/:id", auth, getReview);

export default router;
