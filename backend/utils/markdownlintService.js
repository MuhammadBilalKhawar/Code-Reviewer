import { createRequire } from "module";
import { githubApi } from "./githubapi.js";
import { getSuggestion } from "./suggestionGenerator.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

const require = createRequire(import.meta.url);
const markdownlint = require("markdownlint");

export const analyzeWithMarkdownlint = async (owner, repo, accessToken) => {
  let tempDir = null;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "markdownlint-analysis-"));

    const repoContents = await githubApi.getRepoContents(owner, repo, "", accessToken);

    if (!Array.isArray(repoContents) || repoContents.length === 0) {
      return { success: false, message: "No files found in repository" };
    }

    const mdFiles = repoContents.filter(
      (file) => file?.name && /\.md$/i.test(file.name) && file.type === "file"
    );

    if (mdFiles.length === 0) {
      return { success: false, message: "No Markdown files found in repository" };
    }

    let totalIssues = 0;
    const issuesByFile = [];
    const allIssues = [];

    for (const file of mdFiles.slice(0, 30)) {
      const content = await githubApi.getFileContent(owner, repo, file.path, accessToken);
      if (!content) continue;

      const result = markdownlint({
        strings: { [file.path]: content },
      });

      const issues = result[file.path] || [];
      totalIssues += issues.length;

      if (issues.length > 0) {
        const enrichedIssues = issues.map(issue => {
          const suggestion = getSuggestion(issue.ruleNames[0]);
          return {
            ...issue,
            file: file.path,
            suggestion: suggestion.suggestion,
            fixTitle: suggestion.title
          };
        });
        
        issuesByFile.push({
          file: file.path,
          issueCount: issues.length,
          issues: enrichedIssues.slice(0, 10),
        });
        allIssues.push(...enrichedIssues);
      }
    }

    const deduction = Math.min(totalIssues * 2, 60);
    const score = Math.max(0, 100 - deduction);

    return {
      success: true,
      analysis: {
        filesAnalyzed: Math.min(mdFiles.length, 30),
        totalIssues,
        score,
        grade: calculateGrade(score),
        issuesByFile: issuesByFile.slice(0, 15),
        topIssues: allIssues.slice(0, 10),
        allIssues: allIssues.slice(0, 100),
      },
      metadata: {
        tool: "Markdownlint",
        timestamp: new Date().toISOString(),
        repository: `${owner}/${repo}`,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
};

export const getMarkdownlintSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithMarkdownlint(owner, repo, accessToken);
  if (!result.success) return result;

  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.totalIssues} markdown issues across ${result.analysis.filesAnalyzed} files`,
    details: result.analysis,
    metadata: result.metadata,
  };
};

function calculateGrade(score) {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}
