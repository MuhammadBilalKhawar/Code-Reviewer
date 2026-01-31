import { HTMLHint } from 'htmlhint';
import { githubApi } from './githubapi.js';
import { getSuggestion } from './suggestionGenerator.js';

/**
 * Analyze HTML files from a GitHub repository using HTMLHint
 */
export const analyzeWithHTMLHint = async (owner, repo, accessToken) => {
  try {
    // Fetch repository contents
    const repoContents = await githubApi.getRepoContents(owner, repo, '', accessToken);
    
    // Ensure it's an array
    if (!Array.isArray(repoContents) || repoContents.length === 0) {
      return {
        success: false,
        message: 'No files found in repository'
      };
    }
    
    // Filter for HTML files
    const htmlFiles = repoContents.filter(file => 
      file && file.name && /\.(html|htm)$/.test(file.name) && file.type === 'file'
    );
    
    if (htmlFiles.length === 0) {
      return {
        success: false,
        message: 'No HTML files found in repository'
      };
    }
    
    // HTMLHint rules configuration
    const ruleset = {
      'tagname-lowercase': true,
      'attr-lowercase': true,
      'attr-value-double-quotes': true,
      'doctype-first': true,
      'tag-pair': true,
      'spec-char-escape': true,
      'id-unique': true,
      'src-not-empty': true,
      'attr-no-duplication': true,
      'title-require': true,
      'alt-require': true,
      'doctype-html5': true,
      'id-class-value': 'dash',
      'style-disabled': false,
      'inline-style-disabled': false,
      'inline-script-disabled': false,
      'space-tab-mixed-disabled': 'space',
      'id-class-ad-disabled': true,
      'href-abs-or-rel': false,
      'attr-unsafe-chars': true
    };
    
    // Analyze each file
    let totalErrors = 0;
    let totalWarnings = 0;
    const issuesByFile = [];
    const issuesByType = {
      'Structure': [],
      'Attributes': [],
      'Accessibility': [],
      'Best Practices': []
    };
    const allIssues = [];
    
    for (const file of htmlFiles.slice(0, 20)) { // Limit to 20 files
      try {
        const content = await githubApi.getFileContent(owner, repo, file.path, accessToken);
        if (!content) {
          continue;
        }
        const messages = HTMLHint.verify(content, ruleset);
        
        const fileErrors = messages.filter(m => m.type === 'error').length;
        const fileWarnings = messages.filter(m => m.type === 'warning').length;
        
        totalErrors += fileErrors;
        totalWarnings += fileWarnings;
        
        if (messages.length > 0) {
          issuesByFile.push({
            file: file.name,
            errorCount: fileErrors,
            warningCount: fileWarnings,
            messages: messages.slice(0, 10)
          });
          
          messages.forEach(msg => {
            const suggestion = getSuggestion(msg.rule.id);
            const issue = {
              file: file.name,
              line: msg.line,
              column: msg.col,
              message: msg.message,
              rule: msg.rule.id,
              type: msg.type,
              severity: msg.type === 'error' ? 'error' : 'warning',
              suggestion: suggestion.suggestion,
              fixTitle: suggestion.title
            };
            
            allIssues.push(issue);
            
            // Categorize by type
            if (msg.rule.id?.includes('attr') || msg.rule.id?.includes('src') || msg.rule.id?.includes('value')) {
              issuesByType['Attributes'].push(issue);
            } else if (msg.rule.id?.includes('alt') || msg.rule.id?.includes('title')) {
              issuesByType['Accessibility'].push(issue);
            } else if (msg.rule.id?.includes('tag') || msg.rule.id?.includes('doctype') || msg.rule.id?.includes('pair')) {
              issuesByType['Structure'].push(issue);
            } else {
              issuesByType['Best Practices'].push(issue);
            }
          });
        }
      } catch (err) {
        console.error(`Error analyzing file ${file.path}:`, err.message);
      }
    }
    
    // Calculate score
    const errorDeduction = Math.min(totalErrors * 5, 50);
    const warningDeduction = Math.min(totalWarnings * 2, 30);
    const score = Math.max(0, 100 - errorDeduction - warningDeduction);
    const grade = calculateGrade(score);
    
    // Prepare all errors with suggestions
    const allErrors = allIssues.filter(i => i.severity === 'error');
    const allWarnings = allIssues.filter(i => i.severity === 'warning');
    
    return {
      success: true,
      analysis: {
        filesAnalyzed: htmlFiles.length,
        totalErrors,
        totalWarnings,
        score,
        grade,
        issuesByFile: issuesByFile.slice(0, 10),
        issuesByType: {
          'Structure': issuesByType['Structure'].length,
          'Attributes': issuesByType['Attributes'].length,
          'Accessibility': issuesByType['Accessibility'].length,
          'Best Practices': issuesByType['Best Practices'].length
        },
        topIssues: allIssues.slice(0, 10),
        allErrors: allErrors.slice(0, 50),
        allWarnings: allWarnings.slice(0, 50),
        summary: {
          structureIssues: issuesByType['Structure'].length,
          attributeIssues: issuesByType['Attributes'].length,
          accessibilityIssues: issuesByType['Accessibility'].length,
          bestPracticeIssues: issuesByType['Best Practices'].length
        }
      },
      metadata: {
        tool: 'HTMLHint',
        timestamp: new Date().toISOString(),
        repository: `${owner}/${repo}`
      }
    };
    
  } catch (error) {
    console.error('HTMLHint analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get HTMLHint summary
 */
export const getHTMLHintSummary = async (owner, repo, accessToken) => {
  const result = await analyzeWithHTMLHint(owner, repo, accessToken);
  
  if (!result.success) {
    return result;
  }
  
  return {
    success: true,
    score: result.analysis.score,
    grade: result.analysis.grade,
    summary: `Found ${result.analysis.totalErrors} errors and ${result.analysis.totalWarnings} warnings across ${result.analysis.filesAnalyzed} HTML files`,
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
