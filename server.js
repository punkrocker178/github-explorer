import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;
const GITHUB_API_BASE = 'https://api.github.com';
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/callback';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

let userTokens = new Map();

const getAuthHeaders = () => {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Explorer-App'
  };
};

app.get('/auth/login', (req, res) => {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    const sessionId = Date.now().toString();
    userTokens.set(sessionId, tokenData.access_token);
    
    res.redirect(`http://localhost:3000?session=${sessionId}`);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/auth/user', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const token = userTokens.get(sessionId);
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await userResponse.json();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/github/:owner/:repo/*splat', async (req, res) => {
  const { owner, repo } = req.params;
  const path = req.params[0] || '';
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const userToken = userTokens.get(sessionId);
  
  const headers = userToken ? {
    'Authorization': `Bearer ${userToken}`,
    'Accept': 'application/vnd.github.v3+json'
  } : getAuthHeaders();
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, { headers });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GitHub' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});