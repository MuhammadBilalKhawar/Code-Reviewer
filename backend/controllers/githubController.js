import { githubApi } from "../utils/githubapi.js";
import { groq, GROQ_MODEL } from "../utils/groqClient.js";

export const getRepos = async (req, res) => {
  const data = await githubApi(req.user.githubAccessToken, "/user/repos");
  res.json(data);
};

export const getPullRequests = async (req, res) => {
  const { owner, repo } = req.params;
  const data = await githubApi(
    req.user.githubAccessToken,
    `/repos/${owner}/${repo}/pulls`
  );
  res.json(data);
};

export const getPullRequestFiles = async (req, res) => {
  const { owner, repo, number } = req.params;

  const data = await githubApi(
    req.user.githubAccessToken,
    `/repos/${owner}/${repo}/pulls/${number}/files`
  );

  res.json(data);
};

export const getCommits = async (req, res) => {
  const { owner, repo } = req.params;
  const data = await githubApi(
    req.user.githubAccessToken,
    `/repos/${owner}/${repo}/commits`
  );
  res.json(data);
};

export const getCommitFiles = async (req, res) => {
  const { owner, repo, sha } = req.params;
  const data = await githubApi(
    req.user.githubAccessToken,
    `/repos/${owner}/${repo}/commits/${sha}`
  );
  // GitHub commit API returns files array on commit detail
  res.json(data.files || []);
};

// ----------------------
// GENERATE DOCUMENTATION
// ----------------------
export const generateDocumentation = async (req, res) => {
  try {
    const { owner, repo } = req.body;

    // Fetch README if it exists
    let readmeContent = "";
    try {
      const readmeData = await githubApi(
        req.user.githubAccessToken,
        `/repos/${owner}/${repo}/readme`,
        { headers: { Accept: "application/vnd.github.v3.raw" } }
      );
      readmeContent = readmeData;
    } catch (err) {
      // No README, continue
    }

    // Fetch package.json to understand the project
    let packageJsonContent = "";
    try {
      const packageData = await githubApi(
        req.user.githubAccessToken,
        `/repos/${owner}/${repo}/contents/package.json`,
        { headers: { Accept: "application/vnd.github.v3.raw" } }
      );
      packageJsonContent = packageData;
    } catch (err) {
      // No package.json
    }

    // Fetch repo details
    const repoDetails = await githubApi(
      req.user.githubAccessToken,
      `/repos/${owner}/${repo}`
    );

    // Get list of main files/folders
    let filesContent = "";
    try {
      const files = await githubApi(
        req.user.githubAccessToken,
        `/repos/${owner}/${repo}/contents`
      );
      filesContent = files
        .slice(0, 20) // Limit to first 20
        .map((f) => `${f.type === "dir" ? "[DIR]" : "[FILE]"} ${f.name}`)
        .join("\n");
    } catch (err) {
      // Continue
    }

    const prompt = `You are a professional technical documentation writer. Generate comprehensive, well-structured documentation for the following GitHub repository.

Repository: ${owner}/${repo}
Description: ${repoDetails.description || "No description available"}
Language: ${repoDetails.language || "Unknown"}
Stars: ${repoDetails.stargazers_count}

${readmeContent ? `Existing README:\n${readmeContent}\n\n` : ""}
${packageJsonContent ? `Package.json:\n${packageJsonContent}\n\n` : ""}
${filesContent ? `Repository Structure (sample):\n${filesContent}\n\n` : ""}

Please create a professional markdown documentation with the following sections:
1. Project Overview - Clear description of what the project does
2. Features - Key features and capabilities
3. Technology Stack - Technologies and frameworks used
4. Installation Guide - Step-by-step installation instructions
5. Usage - How to use the project with examples
6. Project Structure - Explanation of main directories and files
7. Contributing - Guidelines for contributing
8. License - License information

Return ONLY the markdown content, properly formatted with headers, code blocks, and lists. Make it professional and comprehensive.`;

    console.log(`\n📚 Generating documentation for ${owner}/${repo}...`);

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional technical documentation writer. Generate comprehensive markdown documentation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const documentation = completion.choices[0].message.content || "";

    res.json({
      owner,
      repo,
      documentation,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Documentation Generation Error:", err?.message || err);
    return res.status(500).json({
      message: err?.message || "Failed to generate documentation",
    });
  }
};
