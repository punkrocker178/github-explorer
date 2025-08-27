
export const authService = {
  login: () => {
    window.location.href = `api/auth/login`;
  },
  
  logout: () => {
    localStorage.removeItem('sessionId');
    window.location.reload();
  }
};