import { sessionStorageService } from "./sessionStorage";

export const fetchGitHubData = async (owner: string, repo: string, path = '') => {
  const url = `/api/github/${owner}/${repo}/${path}`;
  const sessionId = localStorage.getItem('sessionId');

  const fetchOptions: RequestInit = sessionId
    ? { headers: { 'Authorization': `Bearer ${sessionId}` } }
    : {};

  try {
    const sessionKey = `${repo}/${path}`;
    let data = sessionStorageService.getItem(sessionKey);

    if (!!data) {
      return new Promise((resolve) => {
        resolve(JSON.parse(data));
      });
    } else {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      if (response.status === 207) {
        const data = await response.json();
        throw { type: 'SESSION_EXPIRED', newSessionId: data.sessionId };
      }

      let responseData = await response.json();
      sessionStorageService.setItem(sessionKey, JSON.stringify(responseData));

      return responseData;
    }
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    throw error;
  }
};