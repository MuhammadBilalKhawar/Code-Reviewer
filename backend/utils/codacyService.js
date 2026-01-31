import axios from 'axios';

const CODACY_BASE_URL = 'https://app.codacy.com/api/v3';
const CODACY_API_TOKEN = process.env.CODACY_API_TOKEN;

/**
 * Get repository analysis overview from Codacy
 * @param {string} provider - Git provider (gh for GitHub, gl for GitLab, bb for Bitbucket)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository analysis data
 */
async function getRepositoryAnalysis(provider = 'gh', owner, repo) {
  try {
    const response = await axios.get(
      `${CODACY_BASE_URL}/analysis/organizations/${provider}/${owner}/repositories/${repo}`,
      {
        headers: {
          'api-token': CODACY_API_TOKEN,
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Repository not found on Codacy. Please add ${owner}/${repo} to Codacy first.`);
    }
    throw new Error(`Codacy API error: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Get code quality issues from Codacy
 * @param {string} provider - Git provider
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Code quality issues
 */
async function getQualityIssues(provider = 'gh', owner, repo) {
  try {
    const response = await axios.get(
      `${CODACY_BASE_URL}/analysis/organizations/${provider}/${owner}/repositories/${repo}/issues`,
      {
        headers: {
          'api-token': CODACY_API_TOKEN,
          'Accept': 'application/json'
        },
        params: {
          limit: 100
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch Codacy issues: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Get code coverage metrics from Codacy
 * @param {string} provider - Git provider
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Coverage metrics
 */
async function getCoverageMetrics(provider = 'gh', owner, repo) {
  try {
    const response = await axios.get(
      `${CODACY_BASE_URL}/analysis/organizations/${provider}/${owner}/repositories/${repo}/coverage`,
      {
        headers: {
          'api-token': CODACY_API_TOKEN,
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    // Coverage might not be configured, return null instead of throwing
    return null;
  }
}

/**
 * Get repository quality grade from Codacy
 * @param {string} provider - Git provider
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Quality grade data
 */
async function getQualityGrade(provider = 'gh', owner, repo) {
  try {
    const response = await axios.get(
      `${CODACY_BASE_URL}/analysis/organizations/${provider}/${owner}/repositories/${repo}/quality-settings`,
      {
        headers: {
          'api-token': CODACY_API_TOKEN,
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Get comprehensive Codacy analysis summary
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} provider - Git provider (default: 'gh' for GitHub)
 * @returns {Promise<Object>} Comprehensive analysis summary
 */
async function getCodacySummary(owner, repo, provider = 'gh') {
  try {
    if (!CODACY_API_TOKEN) {
      throw new Error('CODACY_API_TOKEN not configured in environment variables');
    }

    // Fetch all data in parallel
    const [analysis, issues, coverage, grade] = await Promise.all([
      getRepositoryAnalysis(provider, owner, repo),
      getQualityIssues(provider, owner, repo),
      getCoverageMetrics(provider, owner, repo),
      getQualityGrade(provider, owner, repo)
    ]);

    // Parse analysis data
    const analysisData = analysis?.data || {};
    const issuesData = issues?.data || [];
    const coverageData = coverage?.data || null;

    // Group issues by severity
    const issuesBySeverity = {
      Error: [],
      Warning: [],
      Info: []
    };

    issuesData.forEach(issue => {
      const severity = issue.severity || 'Info';
      if (issuesBySeverity[severity]) {
        issuesBySeverity[severity].push({
          id: issue.id,
          message: issue.message,
          category: issue.category,
          file: issue.filePath,
          line: issue.lineNumber,
          tool: issue.tool
        });
      }
    });

    // Calculate overall score based on grade
    let overallScore = 0;
    let grade_letter = 'N/A';
    
    if (analysisData.grade) {
      grade_letter = analysisData.grade;
      // Convert grade to score (A=90-100, B=80-89, C=70-79, D=60-69, F=0-59)
      const gradeMap = { 'A': 95, 'B': 85, 'C': 75, 'D': 65, 'F': 50 };
      overallScore = gradeMap[grade_letter] || 0;
    }

    return {
      repository: {
        owner,
        name: repo,
        provider
      },
      analysis: {
        grade: grade_letter,
        score: overallScore,
        issues: {
          total: issuesData.length,
          error: issuesBySeverity.Error.length,
          warning: issuesBySeverity.Warning.length,
          info: issuesBySeverity.Info.length
        },
        coverage: coverageData ? {
          percentage: coverageData.coverage || 0,
          coveredLines: coverageData.coveredLines || 0,
          totalLines: coverageData.totalLines || 0
        } : null,
        complexity: analysisData.complexity || null,
        duplication: analysisData.duplication ? {
          percentage: analysisData.duplication.percentage || 0,
          clones: analysisData.duplication.clones || 0
        } : null
      },
      issues: {
        critical: issuesBySeverity.Error,
        major: issuesBySeverity.Warning,
        minor: issuesBySeverity.Info
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        service: 'Codacy',
        dashboard_url: `https://app.codacy.com/${provider}/${owner}/${repo}/dashboard`
      }
    };
  } catch (error) {
    throw new Error(`Failed to get Codacy summary: ${error.message}`);
  }
}

export {
  getRepositoryAnalysis,
  getQualityIssues,
  getCoverageMetrics,
  getQualityGrade,
  getCodacySummary
};
