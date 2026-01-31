import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getRepos,
  getPullRequests,
  getPullRequestFiles,
  getCommits,
  getCommitFiles,
  generateDocumentation,
} from "../controllers/githubController.js";

const router = express.Router();

router.get("/repos", auth, getRepos);
router.get("/repos/:owner/:repo/pull-requests", auth, getPullRequests);
router.get(
  "/repos/:owner/:repo/pull-requests/:number/files",
  auth,
  getPullRequestFiles
);
router.get("/repos/:owner/:repo/commits", auth, getCommits);
router.get("/repos/:owner/:repo/commits/:sha/files", auth, getCommitFiles);
router.post("/repos/generate-documentation", auth, generateDocumentation);

export default router;
