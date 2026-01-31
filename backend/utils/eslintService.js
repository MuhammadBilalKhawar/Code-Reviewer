import { ESLint } from 'eslint';
import { githubApi } from './githubapi.js';
import { getSuggestion } from './suggestionGenerator.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Create ESLint configuration for React projects
const getESLintConfig = () => {
  return {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      // Basic rules
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-undef': 'error',
      'no-duplicate-imports': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn'
    }
  };
};

/**
 * Analyze JavaScript/JSX files from a GitHub repository using ESLint
 */
export const analyzeWithESLint = async (owner, repo, accessToken) => {
  let tempDir = null;
  
  try {
    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eslint-analysis-'));
    
    // Fetch repository contents
    const repoContents = await githubApi.getRepoContents(owner, repo, '', accessToken);
    
    // Ensure it's an array
    if (!Array.isArray(repoContents) || repoContents.length === 0) {
      return {
        success: false,
        message: 'No files found in repository'
      };
    }
    
    // Filter for JS/JSX/TS/TSX files
    const codeFiles = repoContents.filter(file => 
      file && file.name && /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(file.name) && file.type === 'file'
    );
    
    if (codeFiles.length === 0) {
      return {
        success: false,
        message: 'No JavaScript/TypeScript files found in repository'
      };
    }
    
    // Download files to temp directory
    const filePaths = [];
    for (const file of codeFiles.slice(0, 50)) { // Limit to 50 files for performance
      try {
        const content = await githubApi.getFileContent(owner, repo, file.path, accessToken);
        if (!content) {
          continue;
        }
        const filePath = path.join(tempDir, file.name);
        await fs.writeFile(filePath, content, 'utf-8');
        filePaths.push(filePath);
      } catch (err) {
        // Skip files that can't be downloaded
      }
    }
    
    if (filePaths.length === 0) {
      return {
        success: false,
        message: 'Failed to download JavaScript files'
      };
    }
    
    // Write flat ESLint config file (ESLint v9+ requires explicit config file)
    const flatConfig = getESLintConfig();
    const configPath = path.join(tempDir, 'eslint.config.cjs');
    const configContent = `module.exports = [${JSON.stringify(flatConfig, null, 2)}];`;
    await fs.writeFile(configPath, configContent, 'utf-8');

    // Create ESLint instance
    const eslint = new ESLint({
      overrideConfigFile: configPath,
      cwd: tempDir,
      fix: false
    });
    
    // Run ESLint
    const results = await eslint.lintFiles(filePaths);
    
    // Calculate statistics
    let totalErrors = 0;
    let totalWarnings = 0;
    const issuesByFile = [];
    const issuesBySeverity = {
      error: [],
      warning: []
    };
    const issuesByCategory = {
      'Code Quality': [],
      'Best Practices': []
    };
    
    results.forEach(result => {
      const fileName = path.basename(result.filePath);
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;
      
      if (result.messages.length > 0) {
        issuesByFile.push({
          file: fileName,
          errorCount: result.errorCount,
          warningCount: result.warningCount,
          messages: result.messages.slice(0, 10) // Limit messages per file
        });
        
        result.messages.forEach(message => {
          const suggestion = getSuggestion(message.ruleId);
          const issue = {
            file: fileName,
            line: message.line,
            column: message.column,
            message: message.message,
            ruleId: message.ruleId,
            severity: message.severity === 2 ? 'error' : 'warning',
            fix: suggestion.suggestion,
            fixTitle: suggestion.title
          };
          
          // Categorize by severity
          issuesBySeverity[issue.severity].push(issue);
          
          // Categorize by type - simplified for basic ESLint
          if (['no-unused-vars', 'no-console', 'no-debugger', 'no-undef'].includes(message.ruleId)) {
            issuesByCategory['Code Quality'].push(issue);
          } else if (['prefer-const', 'no-var', 'no-duplicate-imports'].includes(message.ruleId)) {
            issuesByCategory['Best Practices'].push(issue);
          } else {
            issuesByCategory['Code Quality'].push(issue);
          }
        });
      }
    });
    
    // Calculate score (100 - deductions)
    const errorDeduction = Math.min(totalErrors * 5, 50); // Max 50 points for errors
    const warningDeduction = Math.min(totalWarnings * 2, 30); // Max 30 points for warnings
    const score = Math.max(0, 100 - errorDeduction - warningDeduction);
    
    // Calculate grade
    const grade = calculateGrade(score);
    
    // Get top issues
    const topIssues = issuesBySeverity.error
      .slice(0, 10)
      .concat(issuesBySeverity.warning.slice(0, 10));
    
    // Get all errors with fixes
    const allErrors = issuesBySeverity.error.map(issue => ({
      ...issue,
      type: 'error'
    }));
    
    const allWarnings = issuesBySeverity.warning.map(issue => ({
      ...issue,
      type: 'warning'
    }));
    
    return {
      success: true,
      analysis: {
        filesAnalyzed: results.length,
        totalErrors,
        totalWarnings,
        score,
        grade,
        issuesByFile: issuesByFile.slice(0, 10), // Top 10 files with issues
        issuesByCategory: {
          'Code Quality': issuesByCategory['Code Quality'].length,
          'Best Practices': issuesByCategory['Best Practices'].length
        },
        topIssues,
        allErrors: allErrors.slice(0, 50),
        allWarnings: allWarnings.slice(0, 50),
        summary: {
          codeQualityIssues: issuesByCategory['Code Quality'].length,
          bestPracticeIssues: issuesByCategory['Best Practices'].length
        }
      },
      metadata: {
        tool: 'ESLint',
        timestamp: new Date().toISOString(),
        repository: `${owner}/${repo}`
      }
    };
    
  } catch (error) {
    console.error('ESLint analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Cleanup temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp directory:', err);
      }
    }
  }
};

/**
 * Get ESLint summary with score and grade
 */
export const getESLintSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithESLint(owner, repo, accessToken);
  
  if (!result.success) {
    return result;
  }
  
  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.totalErrors} errors and ${result.analysis.totalWarnings} warnings across ${result.analysis.filesAnalyzed} files`,
    details: result.analysis,
    metadata: result.metadata
  };
};

/**
 * Calculate letter grade from score
 */
function calculateGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}
