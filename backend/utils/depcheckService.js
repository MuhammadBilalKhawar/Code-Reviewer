import depcheck from "depcheck";
import { githubApi } from "./githubapi.js";
import { getDependencySuggestion } from "./suggestionGenerator.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const analyzeWithDepcheck = async (owner, repo, accessToken) => {
  let tempDir = null;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "depcheck-analysis-"));

    const pkgContent = await githubApi.getFileContent(owner, repo, "package.json", accessToken);
    if (!pkgContent) {
      return { success: false, message: "package.json not found in repository" };
    }

    await fs.writeFile(path.join(tempDir, "package.json"), pkgContent, "utf-8");

    const result = await depcheck(tempDir, {});

    const unusedDeps = result.dependencies || [];
    const unusedDevDeps = result.devDependencies || [];
    const missingDeps = Object.keys(result.missing || {});

    const deduction = Math.min(unusedDeps.length * 2 + unusedDevDeps.length * 1 + missingDeps.length * 5, 80);
    const score = Math.max(0, 100 - deduction);
    
    // Create detailed issues with suggestions
    const unusedDependenciesWithSuggestion = unusedDeps.map((dep, idx) => ({
      id: idx,
      package: dep,
      type: 'unused',
      suggestion: getDependencySuggestion('unused').suggestion,
      fixTitle: getDependencySuggestion('unused').title
    }));
    
    const unusedDevDepsWithSuggestion = unusedDevDeps.map((dep, idx) => ({
      id: idx,
      package: dep,
      type: 'devUnused',
      suggestion: getDependencySuggestion('devUnused').suggestion,
      fixTitle: getDependencySuggestion('devUnused').title
    }));
    
    const missingDepsWithSuggestion = missingDeps.map((dep, idx) => ({
      id: idx,
      package: dep,
      type: 'missing',
      suggestion: getDependencySuggestion('missing').suggestion,
      fixTitle: getDependencySuggestion('missing').title
    }));

    return {
      success: true,
      analysis: {
        score,
        grade: calculateGrade(score),
        unusedDependencies: unusedDependenciesWithSuggestion.slice(0, 30),
        unusedDevDependencies: unusedDevDepsWithSuggestion.slice(0, 30),
        missingDependencies: missingDepsWithSuggestion.slice(0, 30),
        summary: {
          unusedCount: unusedDeps.length,
          unusedDevCount: unusedDevDeps.length,
          missingCount: missingDeps.length,
          total: unusedDeps.length + unusedDevDeps.length + missingDeps.length
        }
      },
      metadata: {
        tool: "depcheck",
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

export const getDepcheckSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithDepcheck(owner, repo, accessToken);
  if (!result.success) return result;

  const totalUnused = result.analysis.unusedDependencies.length + result.analysis.unusedDevDependencies.length;
  const totalMissing = result.analysis.missingDependencies.length;

  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${totalUnused} unused and ${totalMissing} missing dependencies`,
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
