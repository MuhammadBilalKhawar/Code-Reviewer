import { githubApi } from "./githubapi.js";

/**
 * 🔒 GitHub Code Scanning Service
 * Uses CodeQL analysis (free for public repos)
 */

/**
 * Get code scanning alerts from GitHub
 */
export const getCodeScanningAlerts = async (accessToken, owner, repo) => {
  try {
    const response = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/code-scanning/alerts`
    );

    if (!Array.isArray(response)) {
      return {
        alerts: [],
        message: "No code scanning data available",
        status: "NOT_ENABLED",
      };
    }

    const alerts = response.map((alert) => ({
      number: alert.number,
      state: alert.state, // open, dismissed, fixed
      dismissedBy: alert.dismissed_by,
      dismissedAt: alert.dismissed_at,
      dismissReason: alert.dismiss_reason,
      url: alert.url,
      rule: {
        id: alert.rule?.id,
        name: alert.rule?.name,
        severity: alert.rule?.severity, // error, warning, note
        description: alert.rule?.description,
        tags: alert.rule?.tags,
      },
      mostRecentInstance: {
        ref: alert.most_recent_instance?.ref,
        state: alert.most_recent_instance?.state,
        commit_sha: alert.most_recent_instance?.commit_sha,
        message: alert.most_recent_instance?.message?.text,
        location: alert.most_recent_instance?.location,
      },
      createdAt: alert.created_at,
      updatedAt: alert.updated_at,
    }));

    // Group by severity
    const grouped = {
      error: alerts.filter((a) => a.rule?.severity === "error"),
      warning: alerts.filter((a) => a.rule?.severity === "warning"),
      note: alerts.filter((a) => a.rule?.severity === "note"),
    };

    // Calculate score
    let score = 100;
    score -= grouped.error.length * 10; // Critical deduction
    score -= grouped.warning.length * 5; // Medium deduction
    score -= grouped.note.length * 2; // Minor deduction
    score = Math.max(score, 0);

    return {
      score,
      status: "ENABLED",
      total: alerts.length,
      alerts,
      grouped,
      summary: {
        critical: grouped.error.length,
        warnings: grouped.warning.length,
        notes: grouped.note.length,
      },
    };
  } catch (error) {
    console.error("GitHub code scanning error:", error.message);

    // Check if it's a 404 (code scanning not enabled)
    if (error.response?.status === 404) {
      return {
        score: 0,
        status: "NOT_ENABLED",
        message: "Code scanning not enabled on this repository",
        alerts: [],
        grouped: { error: [], warning: [], note: [] },
        summary: { critical: 0, warnings: 0, notes: 0 },
      };
    }

    throw error;
  }
};

/**
 * Get detailed alert information
 */
export const getAlertDetails = async (accessToken, owner, repo, alertNumber) => {
  try {
    const response = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/code-scanning/alerts/${alertNumber}`
    );

    return response;
  } catch (error) {
    console.error("Get alert details error:", error.message);
    throw error;
  }
};

/**
 * Dismiss an alert
 */
export const dismissAlert = async (
  accessToken,
  owner,
  repo,
  alertNumber,
  dismissReason,
  dismissComment
) => {
  try {
    const response = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/code-scanning/alerts/${alertNumber}`,
      {
        method: "PATCH",
        data: {
          state: "dismissed",
          dismissed_reason: dismissReason, // false_positive, won't_fix, used_in_tests
          dismissed_comment: dismissComment,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Dismiss alert error:", error.message);
    throw error;
  }
};

/**
 * 📊 Get Full Code Scanning Summary
 */
export const getCodeScanningSummary = async (accessToken, owner, repo) => {
  try {
    console.log(
      `🔒 Fetching GitHub Code Scanning data for ${owner}/${repo}`
    );

    const scanResults = await getCodeScanningAlerts(
      accessToken,
      owner,
      repo
    );

    if (scanResults.status === "NOT_ENABLED") {
      return {
        score: 0,
        status: "NOT_ENABLED",
        message:
          "Code scanning is not enabled on this repository. Enable it in Settings > Code security > Code scanning.",
        alerts: [],
      };
    }

    // Map to our standard format
    const issues = [];

    scanResults.grouped.error?.forEach((alert) => {
      issues.push({
        severity: "critical",
        type: "security",
        message: alert.rule?.name || "Security vulnerability",
        description: alert.rule?.description || alert.mostRecentInstance?.message,
        file: alert.mostRecentInstance?.location?.path || "Unknown",
        line: alert.mostRecentInstance?.location?.start_line || 0,
        url: alert.url,
        alertNumber: alert.number,
      });
    });

    scanResults.grouped.warning?.forEach((alert) => {
      issues.push({
        severity: "high",
        type: "security",
        message: alert.rule?.name || "Security warning",
        description: alert.rule?.description || alert.mostRecentInstance?.message,
        file: alert.mostRecentInstance?.location?.path || "Unknown",
        line: alert.mostRecentInstance?.location?.start_line || 0,
        url: alert.url,
        alertNumber: alert.number,
      });
    });

    scanResults.grouped.note?.forEach((alert) => {
      issues.push({
        severity: "low",
        type: "info",
        message: alert.rule?.name || "Security note",
        description: alert.rule?.description || alert.mostRecentInstance?.message,
        file: alert.mostRecentInstance?.location?.path || "Unknown",
        line: alert.mostRecentInstance?.location?.start_line || 0,
        url: alert.url,
        alertNumber: alert.number,
      });
    });

    return {
      score: scanResults.score,
      status: "ENABLED",
      total: scanResults.total,
      issues,
      summary: scanResults.summary,
      rules: [
        ...new Set(
          issues.map((i) => i.message)
        ),
      ].slice(0, 10), // Top 10 rules
    };
  } catch (error) {
    console.error("Code scanning summary error:", error.message);
    return {
      score: 0,
      status: "ERROR",
      message: error.message,
      alerts: [],
    };
  }
};

export default {
  getCodeScanningAlerts,
  getAlertDetails,
  dismissAlert,
  getCodeScanningSummary,
};
