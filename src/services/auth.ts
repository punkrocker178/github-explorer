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

  logout: () => {
    localStorage.removeItem('sessionId');
    window.location.reload();
  }
};