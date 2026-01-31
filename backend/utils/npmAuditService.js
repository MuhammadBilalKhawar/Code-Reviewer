import { githubApi } from "./githubapi.js";
import { getVulnerabilitySuggestion } from "./suggestionGenerator.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const analyzeWithNpmAudit = async (owner, repo, accessToken) => {
  let tempDir = null;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "npm-audit-"));

    const lockContent = await githubApi.getFileContent(owner, repo, "package-lock.json", accessToken);
    if (!lockContent) {
      return { success: false, message: "package-lock.json not found in repository" };
    }

    const pkgContent = await githubApi.getFileContent(owner, repo, "package.json", accessToken);
    if (pkgContent) {
      await fs.writeFile(path.join(tempDir, "package.json"), pkgContent, "utf-8");
    }

    await fs.writeFile(path.join(tempDir, "package-lock.json"), lockContent, "utf-8");

    let auditJson;
    try {
      const { stdout } = await execFileAsync("npm", ["audit", "--json", "--package-lock-only"], {
        cwd: tempDir,
      });
      auditJson = JSON.parse(stdout);
    } catch (error) {
      const stdout = error.stdout || "{}";
      auditJson = JSON.parse(stdout);
    }

    const vuln = auditJson.metadata?.vulnerabilities || {};
    const critical = vuln.critical || 0;
    const high = vuln.high || 0;
    const moderate = vuln.moderate || 0;
    const low = vuln.low || 0;

    const deduction = Math.min(critical * 12 + high * 8 + moderate * 4 + low * 1, 100);
    const score = Math.max(0, 100 - deduction);
    
    // Extract detailed vulnerability information
    const vulnerabilities = auditJson.vulnerabilities || {};
    const vulnerabilityList = [];
    
    for (const [pkgName, vulnData] of Object.entries(vulnerabilities)) {
      if (vulnData.via && Array.isArray(vulnData.via)) {
        vulnData.via.forEach(issue => {
          if (typeof issue === 'object' && issue.severity) {
            const suggestion = getVulnerabilitySuggestion(issue.severity);
            vulnerabilityList.push({
              package: pkgName,
              version: vulnData.installed,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              cve: issue.cve,
              suggestion: suggestion.suggestion,
              fixTitle: suggestion.title
            });
          }
        });
      }
    }

    return {
      success: true,
      analysis: {
        score,
        grade: calculateGrade(score),
        vulnerabilities: { critical, high, moderate, low, total: critical + high + moderate + low },
        vulnerabilityList: vulnerabilityList.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
          return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
        }).slice(0, 100),
        summary: {
          critical: vulnerabilityList.filter(v => v.severity === 'critical').length,
          high: vulnerabilityList.filter(v => v.severity === 'high').length,
          moderate: vulnerabilityList.filter(v => v.severity === 'moderate').length,
          low: vulnerabilityList.filter(v => v.severity === 'low').length,
        }
      },
      metadata: {
        tool: "npm audit",
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

export const getNpmAuditSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithNpmAudit(owner, repo, accessToken);
  if (!result.success) return result;

  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.vulnerabilities.total} vulnerabilities`,
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
