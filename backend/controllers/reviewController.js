import Review from "../models/Review.js";
import { githubApi } from "../utils/githubapi.js";
import { groq, GROQ_MODEL } from "../utils/groqClient.js";

// Helper: Truncate diff to fit within Groq token limits
const truncateDiff = (diffs, maxChars = 8000) => {
  if (diffs.length <= maxChars) return diffs;
  const truncated = diffs.substring(0, maxChars);
  return truncated + "\n\n[... diff truncated due to size ...]";
};

// ----------------------
// PR REVIEW (Pull Request)
// ----------------------
export const createReview = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.body;

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available. Please re-authenticate.",
      });
    }

    const files = await githubApi(
      req.user.githubAccessToken,
      `/repos/${owner}/${repo}/pulls/${pullNumber}/files`
    );

    let diffs = files
      .map((f) => `File: ${f.filename}\n${f.patch || ""}`)
      .join("\n\n");

    // Truncate if too large
    diffs = truncateDiff(diffs);

    const prompt = `You are a senior code reviewer. Review the following code changes for the pull request #${pullNumber} in ${owner}/${repo}.

Return ONLY a JSON array of issues found. If no issues, return an empty array []. Do NOT return markdown code blocks or any text outside the JSON array.

Return format:
[
  {
    "file": "string",
    "line": number,
    "severity": "low|medium|high",
    "type": "bug|security|performance|style",
    "message": "string",
    "suggestion": "string"
  }
]

Code diff to review:
${diffs}`;

    // ------------ GROQ AI CALL ------------
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior code reviewer. Return ONLY a valid JSON array, no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const text = completion.choices[0].message.content || "[]";

    let issues = [];
    try {
      let cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }

      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {
        issues = parsed.map((issue) => ({
          file: issue.file || "Unknown file",
          line: issue.line || 1,
          severity: (issue.severity || "low").toLowerCase(),
          type: issue.type || "issue",
          message: issue.message || "No description",
          suggestion: issue.suggestion || "",
        }));
      }
    } catch (err) {
      console.error("Failed to parse Groq response:", err.message);
      issues = [];
    }

    const review = await Review.create({
      user: req.user._id,
      owner,
      repo,
      pullNumber,
      summary: `Found ${issues.length} issues`,
      issues,
    });

    res.json(review);
  } catch (err) {
    console.error("PR Review Error:", err?.message || err);
    return res.status(500).json({
      message: err?.message || "Failed to generate AI review",
    });
  }
};

// ----------------------
// COMMIT REVIEW
// ----------------------
export const createCommitReview = async (req, res) => {
  try {
    const { owner, repo, sha } = req.body;

    if (!req.user.githubAccessToken) {
      return res.status(403).json({
        message: "GitHub token not available. Please re-authenticate.",
      });
    }

    const commitData = await githubApi(
      req.user.githubAccessToken,
      `/repos/${owner}/${repo}/commits/${sha}`
    );

    let diffs = (commitData.files || [])
      .map((f) => `File: ${f.filename}\n${f.patch || ""}`)
      .join("\n\n");

    diffs = truncateDiff(diffs);

    const prompt = `You are a senior code reviewer. Review the following code changes for commit ${sha.substring(
      0,
      7
    )} in ${owner}/${repo}.

Return ONLY a JSON array of issues found. If no issues, return an empty array []. Do NOT return markdown code blocks or any text outside the JSON array.

Return format:
[
  {
    "file": "string",
    "line": number,
    "severity": "low|medium|high",
    "type": "bug|security|performance|style",
    "message": "string",
    "suggestion": "string"
  }
]

Code diff to review:
${diffs}`;

    // ------------ GROQ CALL ------------
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior code reviewer. Return ONLY a valid JSON array, no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const text = completion.choices[0].message.content || "[]";
    console.log(
      `   Groq response (first 300 chars): ${text.substring(0, 300)}`
    );

    let issues = [];
    try {
      // Remove markdown code blocks if present
      let cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

      // Extract JSON array if wrapped in text
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }

      const parsed = JSON.parse(cleaned);

      // Ensure it's an array
      if (Array.isArray(parsed)) {
        issues = parsed.map((issue) => ({
          file: issue.file || "Unknown file",
          line: issue.line || 1,
          severity: (issue.severity || "low").toLowerCase(),
          type: issue.type || "issue",
          message: issue.message || "No description",
          suggestion: issue.suggestion || "",
        }));
      }

      console.log(`   ✅ Parsed ${issues.length} issues from Groq response`);
    } catch (err) {
      console.log(`   ❌ Groq JSON parse error: ${err.message}`);
      console.log(`   Raw response: ${text}`);
      issues = [];
    }

    const review = await Review.create({
      user: req.user._id,
      owner,
      repo,
      commitSha: sha,
      commitMessage: commitData.commit?.message || "Commit Review",
      pullNumber: null,
      summary: `Found ${issues.length} issues`,
      issues,
    });

    res.json(review);
  } catch (err) {
    console.error("Commit Review Error:", err?.message || err);
    return res.status(500).json({
      message: err?.message || "Failed to generate AI review",
    });
  }
};

// ----------------------
// READ REVIEW
// ----------------------
export const getReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.json(review);
};

// ----------------------
// LIST REVIEWS
// ----------------------
export const listReviews = async (req, res) => {
  const { owner, repo, commitSha } = req.query;
  const filter = { user: req.user._id };

  if (owner && repo) {
    filter.owner = owner;
    filter.repo = repo;
  }

  if (commitSha) {
    filter.commitSha = commitSha;
  }

  const reviews = await Review.find(filter).sort({
    createdAt: -1,
  });
  res.json(reviews);
};

// ----------------------
// DASHBOARD STATISTICS
// ----------------------
export const getStatistics = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const totalReviews = reviews.length;
    const prsAnalyzed = reviews.length;

    // Calculate high severity issues
    const highSeverity = reviews.reduce((acc, r) => {
      return acc + (r.issues || []).filter((i) => i.severity === "high").length;
    }, 0);

    // Calculate average time per review (in seconds)
    const avgTime = reviews.length > 0 ? 45 : 0; // Placeholder: average review time

    // Total issues across all reviews
    const totalIssues = reviews.reduce(
      (acc, r) => acc + (r.issues || []).length,
      0
    );

    // Average issues per review
    const avgIssues =
      reviews.length > 0 ? Math.ceil(totalIssues / reviews.length) : 0;

    // Calculate trends
    const thisWeekReviews = reviews.filter((r) => {
      const createdDate = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length;

    const previousWeekReviews = reviews.filter((r) => {
      const createdDate = new Date(r.createdAt);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= twoWeeksAgo && createdDate < weekAgo;
    }).length;

    const reviewTrend =
      previousWeekReviews > 0
        ? (
            ((thisWeekReviews - previousWeekReviews) / previousWeekReviews) *
            100
          ).toFixed(0)
        : thisWeekReviews > 0
        ? 100
        : 0;

    // Transform reviews for frontend
    const recentReviews = reviews.slice(0, 10).map((review) => {
      const issuesByFile = review.issues || [];
      const highCount = issuesByFile.filter(
        (i) => i.severity === "high"
      ).length;
      const mediumCount = issuesByFile.filter(
        (i) => i.severity === "medium"
      ).length;
      const lowCount = issuesByFile.filter((i) => i.severity === "low").length;

      // Determine severity based on highest issue severity
      let severity = "low";
      if (highCount > 0) severity = "high";
      else if (mediumCount > 0) severity = "medium";

      // Format date
      const reviewDate = new Date(review.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - reviewDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let dateStr = "";
      if (diffDays === 0) dateStr = "Today";
      else if (diffDays === 1) dateStr = "Yesterday";
      else if (diffDays < 7) dateStr = `${diffDays} days ago`;
      else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)} weeks ago`;
      else dateStr = `${Math.floor(diffDays / 30)} months ago`;

      return {
        id: review._id.toString(),
        repository: review.repo,
        owner: review.owner,
        prNumber: review.pullNumber,
        issueCount: issuesByFile.length,
        severity,
        date: dateStr,
      };
    });

    res.json({
      totalReviews,
      prsAnalyzed,
      highSeverity,
      avgTime,
      avgIssues,
      thisWeek: thisWeekReviews,
      totalIssues,
      reviewTrend: `${reviewTrend > 0 ? "+" : ""}${reviewTrend}%`,
      recentReviews,
    });
  } catch (err) {
    res.status(500).json({
      message: err?.message || "Failed to fetch statistics",
    });
  }
};
