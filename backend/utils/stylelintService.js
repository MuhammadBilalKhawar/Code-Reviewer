import stylelint from 'stylelint';
import { githubApi } from './githubapi.js';
import { getSuggestion } from './suggestionGenerator.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

/**
 * Analyze CSS/SCSS files from a GitHub repository using Stylelint
 */
export const analyzeWithStylelint = async (owner, repo, accessToken) => {
  let tempDir = null;
  
  try {
    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stylelint-analysis-'));
    
    // Fetch repository contents
    const repoContents = await githubApi.getRepoContents(owner, repo, '', accessToken);
    
    // Ensure it's an array
    if (!Array.isArray(repoContents) || repoContents.length === 0) {
      return {
        success: false,
        message: 'No files found in repository'
      };
    }
    
    // Filter for CSS/SCSS files
    const styleFiles = repoContents.filter(file => 
      file && file.name && /\.(css|scss|sass|less)$/.test(file.name) && file.type === 'file'
    );
    
    if (styleFiles.length === 0) {
      return {
        success: false,
        message: 'No CSS/SCSS files found in repository'
      };
    }
    
    // Download files to temp directory
    const filePaths = [];
    for (const file of styleFiles.slice(0, 30)) { // Limit to 30 files
      try {
        const content = await githubApi.getFileContent(owner, repo, file.path, accessToken);
        if (!content) {
          continue;
        }
        const filePath = path.join(tempDir, file.name);
        await fs.writeFile(filePath, content, 'utf-8');
        filePaths.push({ path: filePath, content });
      } catch (err) {
        // Skip files that can't be downloaded
      }
    }
    
    // Run Stylelint on all files
    const results = await stylelint.lint({
      files: filePaths.map(f => f.path),
      config: {
        extends: ['stylelint-config-standard'],
        rules: {
          'color-no-invalid-hex': true,
          'font-family-no-duplicate-names': true,
          'function-calc-no-unspaced-operator': true,
          'string-no-newline': true,
          'unit-no-unknown': true,
          'property-no-unknown': true,
          'declaration-block-no-duplicate-properties': true,
          'selector-pseudo-class-no-unknown': true,
          'selector-pseudo-element-no-unknown': true,
          'selector-type-no-unknown': true,
          'no-duplicate-selectors': true,
          'no-empty-source': true
        }
      }
    });
    
    // Calculate statistics
    let totalErrors = 0;
    let totalWarnings = 0;
    const issuesByFile = [];
    const issuesBySeverity = {
      error: [],
      warning: []
    };
    const issuesByType = {
      'Colors': [],
      'Layout': [],
      'Typography': [],
      'Syntax': [],
      'Best Practices': []
    };
    
    results.results.forEach(result => {
      const fileName = path.basename(result.source);
      const fileErrors = result.warnings.filter(w => w.severity === 'error').length;
      const fileWarnings = result.warnings.filter(w => w.severity === 'warning').length;
      
      totalErrors += fileErrors;
      totalWarnings += fileWarnings;
      
      if (result.warnings.length > 0) {
        issuesByFile.push({
          file: fileName,
          errorCount: fileErrors,
          warningCount: fileWarnings,
          messages: result.warnings.slice(0, 10)
        });
        
        result.warnings.forEach(warning => {
          const suggestion = getSuggestion(warning.rule);
          const issue = {
            file: fileName,
            line: warning.line,
            column: warning.column,
            message: warning.text,
            rule: warning.rule,
            severity: warning.severity,
            suggestion: suggestion.suggestion,
            fixTitle: suggestion.title
          };
          
          // Categorize by severity
          issuesBySeverity[warning.severity].push(issue);
          
          // Categorize by type
          if (warning.rule?.includes('color')) {
            issuesByType['Colors'].push(issue);
          } else if (warning.rule?.includes('font') || warning.rule?.includes('text')) {
            issuesByType['Typography'].push(issue);
          } else if (warning.rule?.includes('selector') || warning.rule?.includes('property')) {
            issuesByType['Syntax'].push(issue);
          } else if (warning.rule?.includes('unit') || warning.rule?.includes('value')) {
            issuesByType['Layout'].push(issue);
          } else {
            issuesByType['Best Practices'].push(issue);
          }
        });
      }
    });
    
    // Calculate score
    const errorDeduction = Math.min(totalErrors * 5, 50);
    const warningDeduction = Math.min(totalWarnings * 2, 30);
    const score = Math.max(0, 100 - errorDeduction - warningDeduction);
    const grade = calculateGrade(score);
    
    // Prepare all errors with suggestions
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
        filesAnalyzed: results.results.length,
        totalErrors,
        totalWarnings,
        score,
        grade,
        issuesByFile: issuesByFile.slice(0, 10),
        issuesByType: {
          'Colors': issuesByType['Colors'].length,
          'Layout': issuesByType['Layout'].length,
          'Typography': issuesByType['Typography'].length,
          'Syntax': issuesByType['Syntax'].length,
          'Best Practices': issuesByType['Best Practices'].length
        },
        topIssues: [
          ...issuesBySeverity.error.slice(0, 5),
          ...issuesBySeverity.warning.slice(0, 5)
        ],
        allErrors: allErrors.slice(0, 50),
        allWarnings: allWarnings.slice(0, 50),
        summary: {
          colorIssues: issuesByType['Colors'].length,
          layoutIssues: issuesByType['Layout'].length,
          typographyIssues: issuesByType['Typography'].length,
          syntaxIssues: issuesByType['Syntax'].length
        }
      },
      metadata: {
        tool: 'Stylelint',
        timestamp: new Date().toISOString(),
        repository: `${owner}/${repo}`
      }
    };
    
  } catch (error) {
    console.error('Stylelint analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Cleanup
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
 * Get Stylelint summary
 */
export const getStylelintSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithStylelint(owner, repo, accessToken);
  
  if (!result.success) {
    return result;
  }
  
  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.totalErrors} errors and ${result.analysis.totalWarnings} warnings across ${result.analysis.filesAnalyzed} CSS files`,
    details: result.analysis,
    metadata: result.metadata
  };
};

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
