const API_BASE = 'http://localhost:3001';

export const authService = {
  login: () => {
    window.location.href = `${API_BASE}/auth/login`;
  },

  getUser: async (sessionId: string) => {
    const response = await fetch(`${API_BASE}/auth/user`, {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    });
    return response.ok ? response.json() : null;
  },

  getSessionFromUrl: () => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    if (session) {
      localStorage.setItem('github_session', session);
      window.history.replaceState({}, '', window.location.pathname);
    }
    return session || localStorage.getItem('github_session');
  },

  logout: () => {
    localStorage.removeItem('github_session');
    window.location.reload();
  }
};