/**
 * Generates suggested fixes for various code quality issues
 */

const ruleSuggestions = {
  // ESLint suggestions
  'no-unused-vars': {
    title: 'Remove unused variables',
    suggestion: 'Delete the variable declaration or use it in your code'
  },
  'no-console': {
    title: 'Remove console statements',
    suggestion: 'Replace console logs with proper logging or remove in production code'
  },
  'no-debugger': {
    title: 'Remove debugger statements',
    suggestion: 'Delete debugger statements before committing code'
  },
  'no-undef': {
    title: 'Define undefined variables',
    suggestion: 'Declare the variable before use or import it from another module'
  },
  'no-duplicate-imports': {
    title: 'Merge duplicate imports',
    suggestion: 'Combine multiple imports from the same module into one statement'
  },
  'prefer-const': {
    title: 'Use const instead of let',
    suggestion: 'Change "let" to "const" if the variable is not reassigned'
  },
  'no-var': {
    title: 'Use let or const instead of var',
    suggestion: 'Replace "var" with "let" or "const" for better scoping'
  },

  // Stylelint suggestions
  'color-no-invalid-hex': {
    title: 'Fix invalid hex color codes',
    suggestion: 'Use valid hex color format (#RGB, #RRGGBB, #RGBA, or #RRGGBBAA)'
  },
  'font-family-no-duplicate-names': {
    title: 'Remove duplicate font family names',
    suggestion: 'Remove duplicate font names from font-family declarations'
  },
  'function-calc-no-unspaced-operator': {
    title: 'Add spaces around calc operators',
    suggestion: 'Use spaces around +, -, *, / operators in calc() functions'
  },
  'unit-no-unknown': {
    title: 'Use valid CSS units',
    suggestion: 'Use valid CSS units (px, em, rem, %, etc.) in your declarations'
  },
  'property-no-unknown': {
    title: 'Fix unknown CSS properties',
    suggestion: 'Check the spelling of the CSS property or use a vendor prefix if needed'
  },

  // Prettier issues
  'format-issue': {
    title: 'Fix code formatting',
    suggestion: 'Run prettier with --write flag to auto-format: prettier --write <file>'
  },

  // Markdown lint suggestions
  'MD001': {
    title: 'Fix heading levels',
    suggestion: 'Use correct heading hierarchy (h1 -> h2, no skipping levels)'
  },
  'MD003': {
    title: 'Use consistent heading style',
    suggestion: 'Use consistent heading delimiter (#, ##, etc.) throughout'
  },
  'MD004': {
    title: 'Use consistent unordered list marker',
    suggestion: 'Use the same bullet point style (-, *, +) consistently'
  },
  'MD005': {
    title: 'Fix list indentation',
    suggestion: 'Ensure list items are properly indented'
  },
  'MD007': {
    title: 'Fix unordered list indentation',
    suggestion: 'Use correct indentation for nested list items'
  },
  'MD009': {
    title: 'Remove trailing spaces',
    suggestion: 'Remove spaces at the end of lines'
  },
  'MD010': {
    title: 'Use spaces instead of tabs',
    suggestion: 'Replace tab characters with spaces for consistency'
  },
  'MD012': {
    title: 'Limit blank lines',
    suggestion: 'Remove multiple consecutive blank lines (max 1)'
  },
  'MD013': {
    title: 'Keep lines short',
    suggestion: 'Break long lines into multiple lines for readability'
  },
  'MD014': {
    title: 'Use proper list markers',
    suggestion: 'Use proper list marker format for ordered lists (1., 2., etc.)'
  },
  'MD018': {
    title: 'Add space after hash in heading',
    suggestion: 'Add space after # character in heading: # Heading'
  },
  'MD019': {
    title: 'Remove spaces after hash in heading',
    suggestion: 'Remove extra spaces after # character: # Heading not ##  Heading'
  },
  'MD020': {
    title: 'Fix closing hash in heading',
    suggestion: 'Use correct closing hash format in heading'
  },
  'MD021': {
    title: 'Fix heading format',
    suggestion: 'Ensure heading follows correct markdown format'
  },
  'MD022': {
    title: 'Add blank line around headings',
    suggestion: 'Add blank line before and after headings'
  },
  'MD023': {
    title: 'Fix heading indentation',
    suggestion: 'Headings should not be indented'
  },
  'MD024': {
    title: 'Avoid duplicate headings',
    suggestion: 'Use unique heading text throughout the document'
  },
  'MD025': {
    title: 'Only one h1 heading',
    suggestion: 'Use only one main heading (# Heading) per document'
  },
  'MD026': {
    title: 'Remove punctuation from heading',
    suggestion: 'Remove trailing punctuation from headings'
  },
  'MD027': {
    title: 'Remove multiple spaces from list',
    suggestion: 'Use single space for list indentation'
  },
  'MD028': {
    title: 'Fix blank line in blockquote',
    suggestion: 'Remove blank lines inside blockquotes or add content'
  },
  'MD029': {
    title: 'Use correct ordered list format',
    suggestion: 'Use sequential numbers (1., 2., 3.) for ordered lists'
  },
  'MD030': {
    title: 'Fix spacing in lists',
    suggestion: 'Use consistent spacing after list markers'
  },
  'MD031': {
    title: 'Add code fence after code',
    suggestion: 'Properly close code blocks with triple backticks'
  },
  'MD032': {
    title: 'Add blank lines around lists',
    suggestion: 'Add blank line before and after list blocks'
  },
  'MD033': {
    title: 'Avoid HTML tags',
    suggestion: 'Use markdown syntax instead of raw HTML'
  },
  'MD034': {
    title: 'Bare URL not linked',
    suggestion: 'Wrap URLs in angle brackets or use proper link syntax: <URL> or [text](URL)'
  },
  'MD035': {
    title: 'Horizontal rule format',
    suggestion: 'Use consistent horizontal rule format (--- or ***)'
  },
  'MD036': {
    title: 'Emphasis used for heading',
    suggestion: 'Use proper heading syntax (#) instead of emphasis (*text*)'
  },
  'MD037': {
    title: 'Fix spacing in emphasis',
    suggestion: 'Remove spaces inside emphasis markers: *text* not * text *'
  },
  'MD038': {
    title: 'Fix spacing in code',
    suggestion: 'Remove spaces inside code backticks: `code` not ` code `'
  },
  'MD039': {
    title: 'Fix link spacing',
    suggestion: 'Remove spaces inside link brackets and parentheses'
  },
  'MD040': {
    title: 'Add language to code fence',
    suggestion: 'Specify language for code blocks: ```javascript'
  },
  'MD041': {
    title: 'First line should be heading',
    suggestion: 'Start document with a main heading (#)'
  }
};

export const getSuggestion = (ruleId) => {
  return ruleSuggestions[ruleId] || {
    title: 'Fix this issue',
    suggestion: 'Review the error message and address the issue accordingly'
  };
};

export const getVulnerabilitySuggestion = (severity) => {
  const suggestions = {
    'critical': {
      title: 'Fix immediately',
      suggestion: 'Critical vulnerabilities pose a serious security risk. Update to the patched version immediately.'
    },
    'high': {
      title: 'Fix soon',
      suggestion: 'High severity vulnerabilities should be addressed as soon as possible. Check for available updates.'
    },
    'moderate': {
      title: 'Fix in next update',
      suggestion: 'Moderate vulnerabilities should be addressed in your next regular update cycle.'
    },
    'low': {
      title: 'Consider fixing',
      suggestion: 'Low severity vulnerabilities can usually wait for a planned update.'
    }
  };
  
  return suggestions[severity] || suggestions['moderate'];
};

export const getDependencySuggestion = (type) => {
  const suggestions = {
    'unused': {
      title: 'Remove unused dependency',
      suggestion: 'Run: npm uninstall <package-name> and remove from import statements'
    },
    'devUnused': {
      title: 'Remove unused dev dependency',
      suggestion: 'Run: npm uninstall --save-dev <package-name>'
    },
    'missing': {
      title: 'Install missing dependency',
      suggestion: 'Run: npm install <package-name> to add the missing dependency'
    }
  };
  
  return suggestions[type] || suggestions['missing'];
};

export const getFormatSuggestion = () => {
  return {
    title: 'Auto-format the file',
    suggestion: 'Run: prettier --write <filename> to automatically fix formatting'
  };
};
