import { githubApi } from "./githubapi.js";
import { groq, GROQ_MODEL } from "./groqClient.js";

// ====================================
// 1️⃣ CODE QUALITY ANALYZER
// ====================================
export const analyzeCodeQuality = async (accessToken, owner, repo) => {
  try {
    const results = {
      score: 0,
      issues: [],
      metrics: {},
    };

    // Fetch repository contents
    const contents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);
    
    // Fetch languages
    const languages = await githubApi(accessToken, `/repos/${owner}/${repo}/languages`);
    
    // Calculate metrics
    const hasReadme = contents.some(f => f.name.toLowerCase() === 'readme.md');
    const hasGitignore = contents.some(f => f.name === '.gitignore');
    const hasLicense = contents.some(f => f.name.toLowerCase().includes('license'));
    const hasCI = contents.some(f => f.name === '.github' || f.name === '.gitlab-ci.yml');
    
    // Check for package/dependency files
    const hasDependencyFile = contents.some(f => 
      ['package.json', 'requirements.txt', 'pom.xml', 'Gemfile', 'go.mod', 'Cargo.toml'].includes(f.name)
    );
    
    // Check for test directory
    const hasTestDir = contents.some(f => 
      ['tests', 'test', '__tests__', 'spec'].includes(f.name.toLowerCase())
    );

    // Detect structure quality
    const hasProperStructure = contents.some(f => 
      ['src', 'lib', 'app', 'pkg'].includes(f.name.toLowerCase())
    );

    // Calculate base score
    let score = 0;
    if (hasReadme) score += 15;
    if (hasGitignore) score += 10;
    if (hasLicense) score += 10;
    if (hasCI) score += 20;
    if (hasDependencyFile) score += 10;
    if (hasTestDir) score += 25;
    if (hasProperStructure) score += 10;

    // Add issues for missing items
    if (!hasReadme) results.issues.push({ type: 'missing', severity: 'high', message: 'Missing README.md file' });
    if (!hasGitignore) results.issues.push({ type: 'missing', severity: 'medium', message: 'Missing .gitignore file' });
    if (!hasLicense) results.issues.push({ type: 'missing', severity: 'medium', message: 'Missing LICENSE file' });
    if (!hasCI) results.issues.push({ type: 'missing', severity: 'low', message: 'No CI/CD configuration detected' });
    if (!hasTestDir) results.issues.push({ type: 'missing', severity: 'high', message: 'No test directory found' });

    results.score = Math.min(score, 100);
    results.metrics = {
      hasReadme,
      hasGitignore,
      hasLicense,
      hasCI,
      hasTestDir,
      hasProperStructure,
      languages: Object.keys(languages),
      fileCount: contents.length,
    };

    return results;
  } catch (error) {
    console.error('Code quality analysis error:', error.message);
    throw error;
  }
};

// ====================================
// 2️⃣ SECURITY SCANNER
// ====================================
export const scanSecurity = async (accessToken, owner, repo) => {
  try {
    const results = {
      score: 100,
      vulnerabilities: [],
      warnings: [],
    };

    // Fetch repository contents
    const contents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);

    // Check for dependency files
    const packageJson = contents.find(f => f.name === 'package.json');
    const requirementsTxt = contents.find(f => f.name === 'requirements.txt');

    if (packageJson) {
      // Fetch package.json content
      const pkgContent = await githubApi(
        accessToken, 
        `/repos/${owner}/${repo}/contents/package.json`,
        { headers: { Accept: 'application/vnd.github.v3.raw' } }
      );
      
      const pkg = typeof pkgContent === 'string' ? JSON.parse(pkgContent) : pkgContent;
      
      // Check for common vulnerable patterns
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Check for outdated or vulnerable patterns
      Object.keys(deps).forEach(dep => {
        const version = deps[dep];
        
        // Check for wildcards (security risk)
        if (version === '*' || version === 'latest') {
          results.vulnerabilities.push({
            package: dep,
            severity: 'medium',
            issue: 'Using wildcard or "latest" version',
            recommendation: 'Pin to specific version'
          });
          results.score -= 5;
        }
      });
    }

    if (requirementsTxt) {
      // Analyze Python requirements
      const reqContent = await githubApi(
        accessToken,
        `/repos/${owner}/${repo}/contents/requirements.txt`,
        { headers: { Accept: 'application/vnd.github.v3.raw' } }
      );
      
      const lines = reqContent.split('\n');
      lines.forEach(line => {
        if (line.trim() && !line.startsWith('#') && !line.includes('==')) {
          results.vulnerabilities.push({
            package: line.trim(),
            severity: 'low',
            issue: 'Unpinned Python dependency',
            recommendation: 'Use pinned versions (==)'
          });
          results.score -= 3;
        }
      });
    }

    // Check for security files
    const hasSecurityPolicy = contents.some(f => 
      f.name.toLowerCase() === 'security.md' || f.path === '.github/SECURITY.md'
    );
    
    if (!hasSecurityPolicy) {
      results.warnings.push('No SECURITY.md file found');
    }

    // Check for secrets in repo (basic check)
    const hasDotEnv = contents.some(f => f.name === '.env');
    if (hasDotEnv) {
      results.vulnerabilities.push({
        file: '.env',
        severity: 'critical',
        issue: '.env file committed to repository',
        recommendation: 'Remove .env and add to .gitignore'
      });
      results.score -= 30;
    }

    results.score = Math.max(results.score, 0);
    return results;
  } catch (error) {
    console.error('Security scan error:', error.message);
    throw error;
  }
};

// ====================================
// 3️⃣ TEST READINESS DETECTOR
// ====================================
export const detectTestReadiness = async (accessToken, owner, repo) => {
  try {
    const results = {
      score: 0,
      hasTests: false,
      testFramework: null,
      coverage: null,
      issues: [],
    };

    // Fetch repository contents
    const contents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);
    
    // Check for test directories
    const testDirs = contents.filter(f => 
      ['tests', 'test', '__tests__', 'spec'].includes(f.name.toLowerCase())
    );
    
    if (testDirs.length > 0) {
      results.hasTests = true;
      results.score += 40;
    } else {
      results.issues.push({ 
        severity: 'high', 
        message: 'No test directory found (tests/, __tests__, spec/)' 
      });
    }

    // Check for test configuration files
    const packageJson = contents.find(f => f.name === 'package.json');
    const hasJestConfig = contents.some(f => f.name === 'jest.config.js' || f.name === 'jest.config.json');
    const hasPytestConfig = contents.some(f => f.name === 'pytest.ini' || f.name === 'setup.cfg');
    const hasGoTest = contents.some(f => f.name.endsWith('_test.go'));

    if (packageJson) {
      // Check for test scripts
      const pkgContent = await githubApi(
        accessToken,
        `/repos/${owner}/${repo}/contents/package.json`,
        { headers: { Accept: 'application/vnd.github.v3.raw' } }
      );
      
      const pkg = typeof pkgContent === 'string' ? JSON.parse(pkgContent) : pkgContent;
      
      if (pkg.scripts?.test) {
        results.score += 20;
        results.testFramework = 'Jest/Mocha/Vitest';
      } else {
        results.issues.push({ 
          severity: 'medium', 
          message: 'No "test" script in package.json' 
        });
      }

      // Check for coverage scripts
      if (pkg.scripts?.['test:coverage'] || pkg.scripts?.coverage) {
        results.score += 20;
        results.coverage = 'configured';
      } else {
        results.issues.push({ 
          severity: 'low', 
          message: 'No coverage script configured' 
        });
      }

      // Detect framework
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.jest) results.testFramework = 'Jest';
      else if (deps.mocha) results.testFramework = 'Mocha';
      else if (deps.vitest) results.testFramework = 'Vitest';
      else if (deps.jasmine) results.testFramework = 'Jasmine';
    }

    if (hasJestConfig) {
      results.score += 10;
      results.testFramework = 'Jest';
    }

    if (hasPytestConfig) {
      results.score += 20;
      results.testFramework = 'Pytest';
    }

    if (hasGoTest) {
      results.score += 20;
      results.testFramework = 'Go Testing';
    }

    // Check for CI testing
    const hasGithubActions = contents.some(f => f.name === '.github');
    if (hasGithubActions) {
      results.score += 10;
    }

    results.score = Math.min(results.score, 100);
    return results;
  } catch (error) {
    console.error('Test readiness error:', error.message);
    throw error;
  }
};

// ====================================
// 4️⃣ PERFORMANCE ANALYZER
// ====================================
export const analyzePerformance = async (accessToken, owner, repo) => {
  try {
    const results = {
      score: 100,
      issues: [],
      suggestions: [],
    };

    // Fetch repository contents
    const contents = await githubApi(accessToken, `/repos/${owner}/${repo}/contents`);
    
    // Check for package.json (if Node.js project)
    const packageJson = contents.find(f => f.name === 'package.json');
    
    if (packageJson) {
      const pkgContent = await githubApi(
        accessToken,
        `/repos/${owner}/${repo}/contents/package.json`,
        { headers: { Accept: 'application/vnd.github.v3.raw' } }
      );
      
      const pkg = typeof pkgContent === 'string' ? JSON.parse(pkgContent) : pkgContent;
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Check for heavy dependencies
      const heavyDeps = ['moment', 'lodash', 'jquery'];
      heavyDeps.forEach(dep => {
        if (deps[dep]) {
          results.issues.push({
            type: 'performance',
            severity: 'low',
            message: `Heavy dependency detected: ${dep}`,
            suggestion: dep === 'moment' ? 'Consider date-fns or dayjs' : 
                       dep === 'lodash' ? 'Consider lodash-es for tree-shaking' :
                       'Consider modern alternatives'
          });
          results.score -= 5;
        }
      });

      // Check for build optimization
      if (!pkg.scripts?.build) {
        results.suggestions.push('Add build script for production optimization');
      }
    }

    // Check for optimization files
    const hasWebpackConfig = contents.some(f => f.name.includes('webpack'));
    const hasViteConfig = contents.some(f => f.name.includes('vite'));
    
    if (hasWebpackConfig || hasViteConfig) {
      results.score += 10;
    }

    // Check for caching strategy
    const hasServiceWorker = contents.some(f => f.name === 'service-worker.js' || f.name === 'sw.js');
    if (hasServiceWorker) {
      results.score += 10;
    } else {
      results.suggestions.push('Consider adding service worker for offline caching');
    }

    results.score = Math.max(results.score, 0);
    return results;
  } catch (error) {
    console.error('Performance analysis error:', error.message);
    throw error;
  }
};

// ====================================
// 5️⃣ AI-BASED CODE ANALYSIS (using Groq)
// ====================================
export const aiCodeAnalysis = async (accessToken, owner, repo) => {
  try {
    // Fetch recent commits to analyze code patterns
    const commits = await githubApi(accessToken, `/repos/${owner}/${repo}/commits?per_page=5`);
    
    if (commits.length === 0) {
      return {
        score: 50,
        insights: ['Repository has no commits yet'],
        suggestions: [],
      };
    }

    // Get the latest commit details
    const latestCommit = commits[0];
    const commitDetail = await githubApi(
      accessToken,
      `/repos/${owner}/${repo}/commits/${latestCommit.sha}`
    );

    // Extract code patterns from recent changes
    const files = commitDetail.files || [];
    const codeSnippets = files.slice(0, 3).map(f => ({
      filename: f.filename,
      changes: f.patch || '',
    }));

    // Prepare prompt for AI analysis
    const prompt = `Analyze this codebase based on recent changes. Provide insights about code quality, patterns, and suggestions.

Recent files changed:
${codeSnippets.map(s => `File: ${s.filename}\n${s.changes.substring(0, 500)}`).join('\n\n')}

Return ONLY a JSON object with this format:
{
  "score": number (0-100),
  "insights": ["string"],
  "suggestions": ["string"],
  "patterns": ["string"]
}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a senior software architect. Return ONLY valid JSON, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = completion.choices[0].message.content || '{}';
    let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleaned);

    return {
      score: result.score || 70,
      insights: result.insights || [],
      suggestions: result.suggestions || [],
      patterns: result.patterns || [],
    };
  } catch (error) {
    console.error('AI code analysis error:', error.message);
    return {
      score: 60,
      insights: ['Unable to perform detailed AI analysis'],
      suggestions: ['Ensure repository has recent commits'],
      patterns: [],
    };
  }
};

// ====================================
// 🎯 MAIN TESTING ORCHESTRATOR
// ====================================
export const runFullTest = async (accessToken, owner, repo) => {
  try {
    console.log(`🧪 Starting full test for ${owner}/${repo}`);

    const [codeQuality, security, testReadiness, performance, aiAnalysis] = await Promise.all([
      analyzeCodeQuality(accessToken, owner, repo),
      scanSecurity(accessToken, owner, repo),
      detectTestReadiness(accessToken, owner, repo),
      analyzePerformance(accessToken, owner, repo),
      aiCodeAnalysis(accessToken, owner, repo),
    ]);

    // Calculate overall score
    const overallScore = Math.round(
      (codeQuality.score * 0.25 +
        security.score * 0.30 +
        testReadiness.score * 0.25 +
        performance.score * 0.10 +
        aiAnalysis.score * 0.10)
    );

    // Determine grade
    let grade = 'F';
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 80) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 60) grade = 'C';
    else if (overallScore >= 50) grade = 'D';

    return {
      repository: `${owner}/${repo}`,
      overallScore,
      grade,
      timestamp: new Date().toISOString(),
      results: {
        codeQuality,
        security,
        testReadiness,
        performance,
        aiAnalysis,
      },
    };
  } catch (error) {
    console.error('Full test error:', error.message);
    throw error;
  }
};
