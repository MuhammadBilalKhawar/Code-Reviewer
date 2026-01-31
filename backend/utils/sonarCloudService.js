import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SONARCLOUD_API_URL = "https://sonarcloud.io/api";
const SONARCLOUD_TOKEN = process.env.SONARCLOUD_TOKEN;
const SONARCLOUD_PROJECT_KEY = process.env.SONARCLOUD_PROJECT_KEY;

if (!SONARCLOUD_TOKEN) {
  console.warn("⚠️  SONARCLOUD_TOKEN not set in environment");
}

/**
 * Initialize axios instance for SonarCloud API
 */
const sonarCloudApi = axios.create({
  baseURL: SONARCLOUD_API_URL,
  auth: {
    username: SONARCLOUD_TOKEN,
    password: "",
  },
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get project key for repository
 * Format: github-owner_repo-name
 */
export const getProjectKey = (owner, repo) => {
  if (SONARCLOUD_PROJECT_KEY) {
    return SONARCLOUD_PROJECT_KEY;
  }
  return `github-${owner}_${repo}`;
};

const getCandidateProjectKeys = (owner, repo) => {
  const keys = new Set([
    getProjectKey(owner, repo),
    `${owner}_${repo}`,
    `${owner}-${repo}`,
    `${repo}`,
  ]);
  return Array.from(keys).filter(Boolean);
};

/**
 * 🔍 Get Project Analysis Results from SonarCloud
 */
export const getProjectAnalysis = async (owner, repo) => {
  try {
    const candidateKeys = getCandidateProjectKeys(owner, repo);

    for (const key of candidateKeys) {
      const response = await sonarCloudApi.get("/projects/search", {
        params: {
          projects: key,
        },
      });

      if (response.data.components.length > 0) {
        const project = response.data.components[0];
        return {
          found: true,
          name: project.name,
          key: project.key,
          lastAnalysis: project.lastAnalysisDate,
        };
      }
    }

    // Fallback: search by repository name
    const searchResponse = await sonarCloudApi.get("/projects/search", {
      params: {
        q: repo,
      },
    });

    const project = searchResponse.data.components?.find((p) =>
      p.key?.includes(owner) || p.name?.includes(repo)
    );

    if (!project) {
      return {
        found: false,
        message: "Project not found in SonarCloud. It may not be analyzed yet or the project key is different.",
      };
    }

    return {
      found: true,
      name: project.name,
      key: project.key,
      lastAnalysis: project.lastAnalysisDate,
    };
  } catch (error) {
    console.error("SonarCloud search error:", error.message);
    throw new Error(`Failed to search SonarCloud project: ${error.message}`);
  }
};

/**
 * 📊 Get Code Metrics from SonarCloud
 */
export const getCodeMetrics = async (owner, repo, projectKeyOverride = null) => {
  try {
    const projectKey = projectKeyOverride || getProjectKey(owner, repo);

    const response = await sonarCloudApi.get("/measures/component", {
      params: {
        component: projectKey,
        metricKeys: [
          "sqale_rating", // Maintainability Rating (A-E)
          "reliability_rating", // Reliability Rating (A-E)
          "security_rating", // Security Rating (A-E)
          "bugs", // Number of bugs
          "vulnerabilities", // Number of vulnerabilities
          "code_smells", // Number of code smells
          "lines_to_cover", // Coverable lines
          "coverage", // Code coverage percentage
          "duplicated_lines_density", // Duplication percentage
          "ncloc", // Non-comment lines of code
        ].join(","),
      },
    });

    if (!response.data.component.measures) {
      return {
        score: 0,
        details: "No metrics available",
      };
    }

    const measures = {};
    response.data.component.measures.forEach((m) => {
      measures[m.metric] = m.value;
    });

    // Calculate overall score (0-100)
    let score = 80; // Start at 80
    const ratings = {
      sqale_rating: measures.sqale_rating, // Maintainability
      reliability_rating: measures.reliability_rating,
      security_rating: measures.security_rating,
    };

    // Deduct points for poor ratings
    Object.values(ratings).forEach((rating) => {
      if (rating === "E") score -= 20;
      else if (rating === "D") score -= 15;
      else if (rating === "C") score -= 10;
      else if (rating === "B") score -= 5;
    });

    // Deduct for bugs and vulnerabilities
    const bugs = parseInt(measures.bugs) || 0;
    const vulns = parseInt(measures.vulnerabilities) || 0;
    score -= Math.min(bugs * 2, 20);
    score -= Math.min(vulns * 3, 30);

    return {
      score: Math.max(score, 0),
      metrics: {
        maintainability: measures.sqale_rating || "N/A",
        reliability: measures.reliability_rating || "N/A",
        security: measures.security_rating || "N/A",
        bugs: parseInt(measures.bugs) || 0,
        vulnerabilities: parseInt(measures.vulnerabilities) || 0,
        codeSmells: parseInt(measures.code_smells) || 0,
        coverage: measures.coverage ? `${measures.coverage}%` : "N/A",
        duplication: measures.duplicated_lines_density
          ? `${measures.duplicated_lines_density}%`
          : "N/A",
        lines: parseInt(measures.ncloc) || 0,
      },
    };
  } catch (error) {
    console.error("SonarCloud metrics error:", error.message);
    throw new Error(`Failed to fetch SonarCloud metrics: ${error.message}`);
  }
};

/**
 * 🐛 Get Issues/Problems from SonarCloud
 */
export const getCodeIssues = async (owner, repo, severity = null, projectKeyOverride = null) => {
  try {
    const projectKey = projectKeyOverride || getProjectKey(owner, repo);

    const params = {
      componentKeys: projectKey,
      s: "FILE_LINE",
      asc: true,
      ps: 100, // Page size (max 500)
    };

    if (severity) {
      params.severities = severity; // BLOCKER, CRITICAL, MAJOR, MINOR, INFO
    }

    const response = await sonarCloudApi.get("/issues/search", {
      params,
    });

    const issues = response.data.issues.map((issue) => ({
      key: issue.key,
      rule: issue.rule,
      severity: issue.severity,
      type: issue.type, // BUG, VULNERABILITY, CODE_SMELL
      message: issue.message,
      component: issue.component,
      line: issue.line,
      status: issue.status,
      url: issue.url,
      createdAt: issue.createdAt,
    }));

    // Group by severity
    const grouped = {
      BLOCKER: issues.filter((i) => i.severity === "BLOCKER"),
      CRITICAL: issues.filter((i) => i.severity === "CRITICAL"),
      MAJOR: issues.filter((i) => i.severity === "MAJOR"),
      MINOR: issues.filter((i) => i.severity === "MINOR"),
      INFO: issues.filter((i) => i.severity === "INFO"),
    };

    return {
      total: issues.length,
      issues,
      grouped,
    };
  } catch (error) {
    console.error("SonarCloud issues error:", error.message);
    throw new Error(`Failed to fetch SonarCloud issues: ${error.message}`);
  }
};

/**
 * 🔒 Get Security Hotspots from SonarCloud
 */
export const getSecurityHotspots = async (owner, repo, projectKeyOverride = null) => {
  try {
    const projectKey = projectKeyOverride || getProjectKey(owner, repo);

    const response = await sonarCloudApi.get("/hotspots/search", {
      params: {
        projectKey,
        ps: 50,
      },
    });

    const hotspots = response.data.hotspots.map((hotspot) => ({
      key: hotspot.key,
      component: hotspot.component,
      vulnerabilityProbability: hotspot.vulnerabilityProbability, // HIGH, MEDIUM, LOW
      securityCategory: hotspot.securityCategory,
      line: hotspot.line,
      message: hotspot.message,
      status: hotspot.status,
      url: hotspot.url,
    }));

    return {
      total: hotspots.length,
      hotspots,
    };
  } catch (error) {
    console.error("SonarCloud hotspots error:", error.message);
    throw new Error(`Failed to fetch SonarCloud hotspots: ${error.message}`);
  }
};

/**
 * 📈 Get Full Project Summary from SonarCloud
 */
export const getProjectSummary = async (owner, repo) => {
  try {
    const projectKey = getProjectKey(owner, repo);

    // Get project info
    const projectInfo = await getProjectAnalysis(owner, repo);
    if (!projectInfo.found) {
      return {
        score: 0,
        message: projectInfo.message,
        status: "NOT_ANALYZED",
      };
    }

    // Get metrics
    const metrics = await getCodeMetrics(owner, repo, projectInfo.key || projectKey);

    // Get issues
    const issues = await getCodeIssues(owner, repo, null, projectInfo.key || projectKey);

    // Get security hotspots
    const hotspots = await getSecurityHotspots(owner, repo, projectInfo.key || projectKey);

    return {
      score: metrics.score,
      status: "ANALYZED",
      project: {
        name: projectInfo.name,
        key: projectInfo.key,
        lastAnalysis: projectInfo.lastAnalysis,
      },
      metrics: metrics.metrics,
      issues: issues.grouped,
      hotspots: hotspots.hotspots,
      summary: {
        totalIssues: issues.total,
        totalHotspots: hotspots.total,
        bugs: issues.grouped.CRITICAL?.length || 0,
        vulnerabilities: issues.grouped.BLOCKER?.length || 0,
      },
    };
  } catch (error) {
    console.error("SonarCloud summary error:", error.message);
    return {
      score: 0,
      status: "ERROR",
      message: error.message,
    };
  }
};

export default {
  getProjectKey,
  getProjectAnalysis,
  getCodeMetrics,
  getCodeIssues,
  getSecurityHotspots,
  getProjectSummary,
};
