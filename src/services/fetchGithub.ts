const GITHUB_API_BASE = 'https://api.github.com/repos/';

export const fetchGitHubData = async (owner: string, repo: string, path = '') => {
  const url = `${GITHUB_API_BASE}${owner}/${repo}/contents/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from GitHub:", error);
    throw error;
  }
};