export const fetchGitHubData = async (owner: string, repo: string, path = '') => {
  const url = `/api/github/${owner}/${repo}/${path}`;
  const sessionId = localStorage.getItem('sessionId');
  
  const fetchOptions: RequestInit = sessionId
    ? { headers: { 'Authorization': `Bearer ${sessionId}` } }
    : {};
  
  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 207) {
      const data = await response.json();
      throw { type: 'SESSION_EXPIRED', newSessionId: data.sessionId };
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    throw error;
  }
};