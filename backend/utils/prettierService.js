import prettier from "prettier";
import { githubApi } from "./githubapi.js";
import { getFormatSuggestion } from "./suggestionGenerator.js";
import path from "path";
import fs from "fs/promises";
import os from "os";

const parserByExtension = {
  ".js": "babel",
  ".jsx": "babel",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mjs": "babel",
  ".cjs": "babel",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".html": "html",
  ".md": "markdown",
  ".yaml": "yaml",
  ".yml": "yaml",
};

const getParser = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  return parserByExtension[ext] || null;
};

export const analyzeWithPrettier = async (owner, repo, accessToken) => {
  let tempDir = null;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prettier-analysis-"));

    const repoContents = await githubApi.getRepoContents(owner, repo, "", accessToken);

    if (!Array.isArray(repoContents) || repoContents.length === 0) {
      return { success: false, message: "No files found in repository" };
    }

    const targetFiles = repoContents.filter((file) => {
      const parser = file?.name ? getParser(file.name) : null;
      return parser && file.type === "file";
    });

    if (targetFiles.length === 0) {
      return { success: false, message: "No supported files found for Prettier" };
    }

    const unformattedFiles = [];
    let parseErrors = 0;

    for (const file of targetFiles.slice(0, 60)) {
      try {
        const content = await githubApi.getFileContent(owner, repo, file.path, accessToken);
        if (!content) continue;

        const parser = getParser(file.name);
        if (!parser) continue;

        const isFormatted = prettier.check(content, { parser });
        if (!isFormatted) {
          unformattedFiles.push({ file: file.path, parser });
        }
      } catch (error) {
        parseErrors += 1;
      }
    }

    const unformattedCount = unformattedFiles.length;
    const errorDeduction = Math.min(parseErrors * 5, 40);
    const formatDeduction = Math.min(unformattedCount * 2, 50);
    const score = Math.max(0, 100 - errorDeduction - formatDeduction);
    
    const suggestion = getFormatSuggestion();

    return {
      success: true,
      analysis: {
        filesAnalyzed: Math.min(targetFiles.length, 60),
        unformattedCount,
        parseErrors,
        score,
        grade: calculateGrade(score),
        unformattedFiles: unformattedFiles.slice(0, 20).map(f => ({
          file: f.file,
          parser: f.parser,
          suggestion: suggestion.suggestion,
          fixTitle: suggestion.title
        })),
        allIssues: unformattedFiles.map((f, idx) => ({
          id: idx,
          file: f.file,
          parser: f.parser,
          message: `File is not properly formatted`,
          suggestion: suggestion.suggestion,
          fixTitle: suggestion.title
        }))
      },
      metadata: {
        tool: "Prettier",
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

export const getPrettierSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithPrettier(owner, repo, accessToken);
  if (!result.success) return result;

  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.unformattedCount} unformatted files and ${result.analysis.parseErrors} parse errors`,
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
