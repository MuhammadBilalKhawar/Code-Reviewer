import axios from "axios";

/**
 * GitHub API wrapper - makes authenticated requests to GitHub
 */
export const githubApi = async (token, endpoint) => {
  const { data } = await axios.get(`https://api.github.com${endpoint}`, {
    headers: { Authorization: `token ${token}` },
  });
  return data;
};

/**
 * Get repository contents recursively
 * Fetches files and directories, excluding node_modules and hidden directories
 */
githubApi.getRepoContents = async (owner, repo, path = '', token, allFiles = []) => {
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    
    // GitHub API returns array for directories, object for files
    const items = Array.isArray(data) ? data : [data];
    
    // Process items and recursively get subdirectories
    for (const item of items) {
      if (item.type === 'file') {
        allFiles.push(item);
      } else if (item.type === 'dir' && !path.includes('node_modules') && !path.includes('.')) {
        // Recursively get contents of subdirectories (skip node_modules and hidden dirs)
        try {
          await githubApi.getRepoContents(owner, repo, item.path, token, allFiles);
        } catch (err) {
          console.warn(`[GitHub API] Could not fetch directory ${item.path}: ${err.message}`);
        }
      }
    }
    
    return allFiles;
  } catch (error) {
    console.error('[GitHub API] Error fetching repo contents:', error.message);
    return allFiles;
  }
};

// Get file content from repository
githubApi.getFileContent = async (owner, repo, filePath, token) => {
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    
    // Handle directories (shouldn't happen in our use case, but just in case)
    if (Array.isArray(data)) {
      throw new Error('Path is a directory, not a file');
    }
    
    // Decode base64 content
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    return data.content || '';
  } catch (error) {
    console.error(`[GitHub API] Error fetching file ${filePath}:`, error.message);
    return null;
  }
};
