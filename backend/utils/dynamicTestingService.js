import { githubApi } from "./githubapi.js";
import { groq, GROQ_MODEL } from "./groqClient.js";

/**
 * Dynamic GitHub Actions Testing Service
 * Generates AI-powered workflows, runs tests locally, and analyzes code quality
 */

/**
 * Generate workflow YAML using AI based on repository structure
 */
export const generateWorkflowYAML = async (owner, repo, testType, accessToken) => {
  try {
    console.log(`🤖 Generating ${testType} workflow for ${owner}/${repo}`);

    // Get repository structure
    const repoContents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);
    const fileTypes = repoContents
      .filter(f => f.type === "file")
      .map(f => f.name)
      .join(", ");

    // Check for package.json to detect project type
    const hasPackageJson = repoContents.some(f => f.name === "package.json");
    let packageJsonContent = null;
    
    if (hasPackageJson) {
      packageJsonContent = await githubApi(accessToken, `/repos/${owner}/${repo}/contents/package.json`);
    }

    const prompt = `You are a GitHub Actions expert. Generate a workflow YAML file for testing.

Repository: ${owner}/${repo}
Files: ${fileTypes}
Test Type: ${testType}
${packageJsonContent ? `Package.json found with dependencies` : "No package.json"}

Generate a complete GitHub Actions workflow that:
1. Checks out the code
2. Sets up the environment (Node.js, Python, etc.)
3. Installs dependencies
4. Runs ${testType} tests/linting
5. Reports results

Requirements:
- Use latest stable versions
- Add comprehensive testing
- Include error reporting
- Format: valid YAML only, no explanations
- Start with "name:" and nothing before it
- MUST include these triggers at the top after name:
  on:
    push:
      branches: [ main, master ]
    pull_request:
      branches: [ main, master ]
    workflow_dispatch:

Generate the workflow YAML:`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a GitHub Actions workflow expert. Generate only valid YAML, no markdown or explanations." },
        { role: "user", content: prompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 2000,
    });

    let yamlContent = response.choices[0]?.message?.content?.trim() || "";
    
    // Clean up the YAML
    yamlContent = yamlContent.replace(/```yaml\n?/g, "").replace(/```\n?/g, "").trim();
    
    if (!yamlContent.startsWith("name:")) {
      throw new Error("Invalid YAML generated");
    }

    return {
      success: true,
      yaml: yamlContent,
      workflowName: `${testType}-test.yml`,
    };
  } catch (error) {
    console.error("Workflow generation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Commit workflow file to repository
 */
export const commitWorkflow = async (accessToken, owner, repo, workflowName, yamlContent, defaultBranch = "main") => {
  try {
    console.log(`📝 Committing workflow ${workflowName} to ${owner}/${repo} (branch: ${defaultBranch})`);

    const path = `.github/workflows/${workflowName}`;
    const content = Buffer.from(yamlContent).toString("base64");
    const message = `Add ${workflowName} workflow for automated testing`;

    // Check if file already exists
    let sha = null;
    try {
      const existing = await githubApi(accessToken, `/repos/${owner}/${repo}/contents/${path}`);
      sha = existing.sha;
      console.log(`📄 File exists, updating with sha: ${sha}`);
    } catch (err) {
      // File doesn't exist, that's fine - we'll create it
      console.log(`📄 File doesn't exist yet, creating new file`);
    }

    // Use the repository's default branch
    const body = {
      message,
      content,
      branch: defaultBranch,
    };

    if (sha) {
      body.sha = sha;
    }

    console.log(`🔄 Sending PUT request to GitHub API...`);
    const result = await githubApi(accessToken, `/repos/${owner}/${repo}/contents/${path}`, "PUT", body);
    console.log(`✅ Workflow committed successfully to ${defaultBranch} branch`);
    
    return {
      success: true,
      path,
      message: "Workflow committed successfully",
    };
  } catch (error) {
    console.error("❌ Commit workflow error:", error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return {
      success: false,
      error: `Failed to commit workflow: ${error.response?.data?.message || error.message}. Make sure you have write access to ${owner}/${repo}.`,
    };
  }
};

/**
 * Trigger workflow run via GitHub Actions API
 */
export const triggerWorkflow = async (accessToken, owner, repo, workflowName, defaultBranch = "main") => {
  try {
    console.log(`🚀 Triggering workflow ${workflowName} on ${defaultBranch} branch`);

    // Create a workflow dispatch event
    await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/actions/workflows/${workflowName}/dispatches`,
      "POST",
      {
        ref: defaultBranch,
      }
    );

    // Wait a bit for GitHub to register the run
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      success: true,
      message: "Workflow triggered",
    };
  } catch (error) {
    console.error("Trigger workflow error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to trigger workflow",
    };
  }
};

/**
 * Get latest workflow run from GitHub Actions
 */
export const getLatestWorkflowRun = async (accessToken, owner, repo, workflowName) => {
  try {
    const runs = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/actions/workflows/${workflowName}/runs?per_page=1`
    );

    if (!runs.workflow_runs || runs.workflow_runs.length === 0) {
      return {
        success: false,
        message: "No workflow runs found",
      };
    }

    const run = runs.workflow_runs[0];

    return {
      success: true,
      run: {
        id: run.id,
        status: run.status,
        conclusion: run.conclusion,
        htmlUrl: run.html_url,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      },
    };
  } catch (error) {
    console.error("Get workflow run error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get workflow run logs from GitHub Actions
 */
export const getWorkflowLogs = async (accessToken, owner, repo, runId) => {
  try {
    const jobs = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`
    );

    const logs = [];
    for (const job of jobs.jobs || []) {
      logs.push({
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        steps: job.steps?.map(step => ({
          name: step.name,
          status: step.status,
          conclusion: step.conclusion,
          number: step.number,
        })),
      });
    }

    return {
      success: true,
      logs,
    };
  } catch (error) {
    console.error("Get logs error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Analyze test results with AI
 */
export const analyzeWithAI = async (conclusion, logs, testType) => {
  try {
    console.log(`🤖 Analyzing ${testType} results with AI`);

    const logSummary = logs.map(job => 
      `Job: ${job.name} (${job.conclusion || job.status})\n` +
      job.steps?.map(step => `  - ${step.name}: ${step.conclusion || step.status}`).join("\n")
    ).join("\n\n");

    const prompt = `Analyze this GitHub Actions test run:

Test Type: ${testType}
Result: ${conclusion}

Job Logs:
${logSummary}

Provide:
1. Overall assessment (success/failure explanation)
2. Key issues found (if any)
3. Recommendations for improvement
4. Score (0-100) based on results

Be concise and actionable.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a code quality expert analyzing test results. Be concise and actionable." },
        { role: "user", content: prompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 1000,
    });

    const analysis = response.choices[0]?.message?.content?.trim() || "Analysis completed.";

    // Extract score from analysis
    const scoreMatch = analysis.match(/score[:\s]+(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : (conclusion === "success" ? 90 : 30);

    return {
      success: true,
      analysis,
      score,
      grade: calculateGrade(score),
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      success: true,
      analysis: conclusion === "success" 
        ? "Tests passed successfully! No issues detected."
        : "Tests failed. Check the workflow logs for details.",
      score: conclusion === "success" ? 85 : 40,
      grade: conclusion === "success" ? "B" : "F",
    };
  }
};

/**
 * Wait for workflow completion with timeout
 */
export const waitForWorkflowCompletion = async (accessToken, owner, repo, workflowName, maxWaitMinutes = 5) => {
  const maxAttempts = maxWaitMinutes * 6; // Check every 10 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    const runResult = await getLatestWorkflowRun(accessToken, owner, repo, workflowName);
    
    if (runResult.success && runResult.run) {
      if (runResult.run.status === "completed") {
        return {
          success: true,
          run: runResult.run,
        };
      }
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    attempts++;
  }

  return {
    success: false,
    message: "Workflow timeout - still running after 5 minutes",
  };
};

/**
 * Complete dynamic testing flow - runs tests locally
 * Steps:
 * 1. Generate workflow YAML with AI
 * 2. Fetch repository code
 * 3. Run tests locally based on test type
 * 4. Return results with workflow YAML for optional GitHub commit
 */
export const runDynamicTest = async (accessToken, owner, repo, testType) => {
  try {
    console.log(`🚀 Starting dynamic ${testType} test for ${owner}/${repo}`);

    // Step 1: Verify repository exists and get info
    let repoInfo;
    try {
      repoInfo = await githubApi(accessToken, `/repos/${owner}/${repo}`);
      console.log(`✅ Repository found: ${repoInfo.full_name}`);
    } catch (err) {
      throw new Error(`Repository ${owner}/${repo} not found or you don't have access to it`);
    }

    // Step 2: Generate workflow YAML with AI
    const workflowResult = await generateWorkflowYAML(owner, repo, testType, accessToken);
    if (!workflowResult.success) {
      throw new Error("Failed to generate workflow: " + workflowResult.error);
    }

    // Step 3: Get repository contents for local testing
    const repoContents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);
    
    // Step 4: Run local tests based on test type
    const testResult = await runLocalTest(accessToken, owner, repo, testType, repoContents);

    // Step 5: Return results with workflow for optional commit
    return {
      success: true,
      status: "completed",
      conclusion: testResult.conclusion,
      score: testResult.score,
      grade: testResult.grade,
      analysis: testResult.analysis,
      details: testResult.details,
      yaml: workflowResult.yaml,
      workflowName: workflowResult.workflowName,
      defaultBranch: repoInfo.default_branch || "main",
      canCommit: true, // User can commit this workflow to GitHub
    };
  } catch (error) {
    console.error("Dynamic test error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Run tests locally based on test type - generates test files and analyzes code
 */
const runLocalTest = async (accessToken, owner, repo, testType, repoContents) => {
  console.log(`🧪 Generating test files and running ${testType} analysis`);

  try {
    // Get all code files from repository
    const codeFiles = await fetchRepositoryFiles(accessToken, owner, repo, repoContents);
    
    if (codeFiles.length === 0) {
      return {
        conclusion: "warning",
        score: 50,
        grade: "D",
        analysis: "No code files found in repository to analyze.",
        details: { filesAnalyzed: 0 },
      };
    }
    
    // Generate test configuration and run analysis based on test type
    const testResult = await generateAndRunTest(testType, codeFiles, owner, repo);
    
    return testResult;
  } catch (error) {
    console.error(`Error running test:`, error);
    return {
      conclusion: "error",
      score: 0,
      grade: "F",
      analysis: `Failed to run test: ${error.message}`,
      details: { error: error.message },
    };
  }
};

/**
 * Generate test configuration and run analysis
 */
const generateAndRunTest = async (testType, codeFiles, owner, repo) => {
  console.log(`🔧 Generating ${testType} test configuration...`);
  
  const filesSummary = codeFiles.map(f => 
    `=== ${f.path} ===\n${f.content}\n`
  ).join("\n");

  let testPrompt = "";
  
  switch (testType) {
    case "eslint":
      testPrompt = `You are an ESLint analyzer. Analyze this code repository and generate a detailed ESLint report.

Repository: ${owner}/${repo}
Files to analyze:
${filesSummary}

Generate an ESLint configuration for this project, then analyze each file for:
- Syntax errors
- Code style issues  
- Potential bugs
- Best practice violations
- Unused variables
- Missing semicolons
- Console statements in production
- Complexity issues

Provide output in this format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

GENERATED CONFIG:
\`\`\`json
[your generated .eslintrc.json]
\`\`\`

ERRORS FOUND: [count]
WARNINGS FOUND: [count]

ISSUES:
- [file:line] - [severity] - [rule] - [description]
- [file:line] - [severity] - [rule] - [description]

ANALYSIS:
[Detailed explanation of issues found]

RECOMMENDATIONS:
- [specific fix]
- [specific fix]`;
      break;

    case "prettier":
      testPrompt = `You are a Prettier code formatter analyzer. Analyze this code for formatting issues.

Repository: ${owner}/${repo}
Files:
${filesSummary}

Generate a Prettier configuration, then check for:
- Inconsistent indentation
- Missing/extra semicolons
- Quote style inconsistencies
- Line length issues
- Trailing whitespace
- Missing trailing commas

Format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

GENERATED CONFIG:
\`\`\`json
[your generated .prettierrc]
\`\`\`

FORMATTING ISSUES: [count]

ISSUES:
- [file:line] - [issue description]

ANALYSIS:
[Summary of formatting problems]

RECOMMENDATIONS:
- [how to fix]`;
      break;

    case "jest":
      testPrompt = `You are a Jest test analyzer. Generate test files and analyze test coverage.

Repository: ${owner}/${repo}
Source Files:
${filesSummary}

For each file:
1. Generate appropriate Jest test files
2. Analyze what should be tested
3. Check for edge cases
4. Evaluate test coverage

Format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

GENERATED TESTS:
\`\`\`javascript
[generated test file content]
\`\`\`

TEST RESULTS:
- Total Tests: [number]
- Passing: [number]
- Failing: [number]
- Coverage: [percentage]%

ISSUES:
- [what's not tested]
- [missing edge cases]

ANALYSIS:
[Test coverage analysis]

RECOMMENDATIONS:
- [what tests to add]`;
      break;

    case "security":
      testPrompt = `You are a security auditor. Scan this code for vulnerabilities.

Repository: ${owner}/${repo}
Files:
${filesSummary}

Check for:
- Hardcoded credentials/API keys
- SQL injection vulnerabilities
- XSS vulnerabilities
- Insecure dependencies
- Exposed sensitive data
- Authentication issues
- Authorization bypasses

Format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

VULNERABILITIES: [count]

CRITICAL ISSUES:
- [file:line] - [vulnerability type] - [description]

HIGH ISSUES:
- [file:line] - [vulnerability type] - [description]

MEDIUM ISSUES:
- [file:line] - [vulnerability type] - [description]

ANALYSIS:
[Security assessment]

RECOMMENDATIONS:
- [how to fix each issue]`;
      break;

    case "performance":
      testPrompt = `You are a performance analyzer. Analyze code for performance issues.

Repository: ${owner}/${repo}
Files:
${filesSummary}

Check for:
- Inefficient algorithms
- Memory leaks
- Large bundle sizes
- Unnecessary re-renders
- Blocking operations
- N+1 queries
- Unoptimized loops

Format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

PERFORMANCE ISSUES: [count]

ISSUES:
- [file:line] - [issue] - [impact]

ANALYSIS:
[Performance assessment]

RECOMMENDATIONS:
- [optimization suggestions]`;
      break;

    case "accessibility":
      testPrompt = `You are an accessibility auditor. Check WCAG compliance.

Repository: ${owner}/${repo}
Files:
${filesSummary}

Check for:
- Missing alt text
- Poor color contrast
- Missing ARIA labels
- Keyboard navigation issues
- Screen reader compatibility
- Focus management
- Semantic HTML

Format:
SCORE: [0-100]
GRADE: [A+/A/B/C/D/F]

A11Y VIOLATIONS: [count]

ISSUES:
- [file:line] - [WCAG level] - [issue]

ANALYSIS:
[Accessibility assessment]

RECOMMENDATIONS:
- [fixes for compliance]`;
      break;

    default:
      testPrompt = `Analyze this code repository for quality issues.

Files:
${filesSummary}

Provide score, issues, and recommendations.`;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert code analyzer. Generate test configurations, run analysis, and provide specific issues with file locations and line numbers. Be thorough and specific." 
        },
        { role: "user", content: testPrompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 3000,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim() || "";
    console.log(`✅ AI analysis complete for ${testType}`);
    
    // Parse the response
    return parseTestResults(aiResponse, testType, codeFiles.length);
  } catch (error) {
    console.error("AI test generation error:", error);
    return {
      conclusion: "error",
      score: 0,
      grade: "F",
      analysis: `Failed to generate and run ${testType} test: ${error.message}`,
      details: { error: error.message },
    };
  }
};

/**
 * Parse test results from AI response
 */
const parseTestResults = (aiResponse, testType, filesAnalyzed) => {
  const scoreMatch = aiResponse.match(/SCORE:\s*(\d+)/i);
  const gradeMatch = aiResponse.match(/GRADE:\s*([A-F][+]?)/i);
  
  // Extract various sections
  const issuesSection = aiResponse.match(/ISSUES:([\s\S]*?)(?=ANALYSIS:|RECOMMENDATIONS:|GENERATED|TEST RESULTS:|$)/i);
  const analysisSection = aiResponse.match(/ANALYSIS:([\s\S]*?)(?=RECOMMENDATIONS:|GENERATED|$)/i);
  const recommendationsSection = aiResponse.match(/RECOMMENDATIONS:([\s\S]*?)$/i);
  const configSection = aiResponse.match(/GENERATED (?:CONFIG|TESTS):([\s\S]*?)(?=ISSUES:|ANALYSIS:|TEST RESULTS:|$)/i);
  
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 60;
  const grade = gradeMatch ? gradeMatch[1] : calculateGrade(score);
  
  const issues = issuesSection 
    ? issuesSection[1].trim().split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
    : [];
  
  const analysis = analysisSection 
    ? analysisSection[1].trim() 
    : aiResponse.slice(0, 500);
  
  const recommendations = recommendationsSection
    ? recommendationsSection[1].trim().split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
    : [];

  const generatedConfig = configSection ? configSection[1].trim() : null;

  return {
    conclusion: score >= 70 ? "success" : score >= 50 ? "warning" : "failure",
    score,
    grade,
    analysis,
    details: {
      filesAnalyzed,
      testType,
      issues: issues.slice(0, 15),
      recommendations: recommendations.slice(0, 8),
      totalIssues: issues.length,
      generatedConfig,
    },
  };
};

/**
 * Fetch actual file contents from repository for analysis
 */
const fetchRepositoryFiles = async (accessToken, owner, repo, repoContents) => {
  const files = [];
  
  // Get relevant files based on type
  const relevantFiles = repoContents.filter(f => {
    if (f.type !== "file") return false;
    const ext = f.name.split(".").pop();
    return ["js", "jsx", "ts", "tsx", "json", "html", "css", "md", "py", "java"].includes(ext);
  });

  // Limit to first 20 files to avoid rate limits
  const filesToFetch = relevantFiles.slice(0, 20);
  
  console.log(`📂 Fetching ${filesToFetch.length} files from repository...`);
  
  for (const file of filesToFetch) {
    try {
      const fileData = await githubApi(accessToken, `/repos/${owner}/${repo}/contents/${file.path}`);
      
      if (fileData.content) {
        const content = Buffer.from(fileData.content, "base64").toString("utf-8");
        files.push({
          path: file.path,
          name: file.name,
          content: content.slice(0, 5000), // Limit content to 5000 chars per file
          size: fileData.size,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${file.name}:`, err.message);
    }
  }
  
  return files;
};

function calculateGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

/**
 * Commit workflow to GitHub after user approval
 */
export const commitWorkflowToGitHub = async (accessToken, owner, repo, workflowName, yamlContent, defaultBranch) => {
  try {
    console.log(`📤 Committing approved workflow ${workflowName} to ${owner}/${repo}`);

    const commitResult = await commitWorkflow(
      accessToken,
      owner,
      repo,
      workflowName,
      yamlContent,
      defaultBranch
    );

    if (!commitResult.success) {
      throw new Error(commitResult.error);
    }

    return {
      success: true,
      message: "Workflow committed successfully to GitHub",
      path: commitResult.path,
    };
  } catch (error) {
    console.error("Commit workflow to GitHub error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  generateWorkflowYAML,
  commitWorkflow,
  commitWorkflowToGitHub,
  triggerWorkflow,
  getLatestWorkflowRun,
  getWorkflowLogs,
  analyzeWithAI,
  waitForWorkflowCompletion,
  runDynamicTest,
};
