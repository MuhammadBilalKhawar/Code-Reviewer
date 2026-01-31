import express from "express";
import {
  githubCallback,
  githubLogin,
  getCurrentUser,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", auth, getCurrentUser);

export default router;
