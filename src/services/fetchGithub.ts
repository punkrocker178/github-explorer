const API_BASE = 'http://localhost:3001/api/github/';

export const fetchGitHubData = async (owner: string, repo: string, path = '') => {
  const url = `${API_BASE}${owner}/${repo}/${path}`;
  const sessionId = localStorage.getItem('sessionId');
  
  const fetchOptions: RequestInit = sessionId
    ? { headers: { 'Authorization': `Bearer ${sessionId}` } }
    : {};
  
  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    throw error;
  }
};