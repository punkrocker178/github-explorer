const API_BASE = 'http://localhost:3001';

export const authService = {
  login: () => {
    window.location.href = `${API_BASE}/auth/login`;
  },
  
  logout: () => {
    localStorage.removeItem('sessionId');
    window.location.reload();
  }
};