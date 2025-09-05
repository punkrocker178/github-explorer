import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AceBase } from 'acebase';

dotenv.config();

const app = express();
const PORT = 3001;
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth';
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
const APP_URI = process.env.APP_URI || 'http://localhost:3000';


const db = new AceBase('github-explorer');

app.use(cors({ credentials: true, origin: APP_URI }));
app.use(express.json());

const getAuthHeaders = () => {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Explorer-App'
  };
};

const getAccessToken = (payload, isRefresh) => {
  const body = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  if (isRefresh) {
    body.refresh_token = payload.refreshToken;
    body.grant_type = 'refresh_token';
  } else {
    body.code = payload.code;
  }

  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  return fetch(`${GITHUB_OAUTH_URL}/access_token`, options);
}

const saveToken = async (tokenData) => {
  const tokenExpiry = Date.now() + tokenData.expires_in * 1000;
  const refreshTokenExpiry = Date.now() + tokenData.refresh_token_expires_in * 1000;
  const sessionId = Date.now().toString();
  const sessionData = {
    token: tokenData.access_token,
    expiresAt: tokenExpiry,
    refreshToken: tokenData.refresh_token,
    refreshTokenExpiresAt: refreshTokenExpiry
  };
  await db.ref(`sessions/${sessionId}`).set(sessionData);
  return sessionId;
}

const removeSession = async (sessionId) => {
  const sessionsRef = db.ref('sessions');
  await sessionsRef.child(sessionId).remove();
};

app.get('/api/auth/login', (req, res) => {
  const authUrl = `${GITHUB_OAUTH_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  console.log('Authorization code received:', code);

  try {
    const tokenResponse = await getAccessToken({ code }, false);
    const tokenData = await tokenResponse.json();
    console.log('Token Data:', tokenData);
    const sessionId = await saveToken(tokenData);
    res.redirect(`${APP_URI}?session=${sessionId}`);
  } catch (error) {
    console.log('Error during authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/user', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const sessionData = await db.ref(`sessions/${sessionId}`).get();
  const token = sessionData.val()?.token;

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

app.get('/api/github/:owner/:repo/{*splat}', async (req, res) => {
  const { owner, repo } = req.params;

  let path = '';
  if (req.params.splat !== undefined && Array.isArray(req.params.splat)) {
    path = req.params.splat.join('/');
  } else {
    path = '';
  }
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const sessionData = await db.ref(`sessions/${sessionId}`).get();
  const userToken = sessionData.val()?.token;
  console.log('userToken:', userToken);
  const headers = userToken ? {
    'Authorization': `Bearer ${userToken}`,
    'Accept': 'application/vnd.github.v3+json'
  } : getAuthHeaders();

  try {
    console.log('Calling GitHub API:', `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, { headers });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          if (response.message && response.message.includes('Bad credentials') || Date.now() > sessionData.val()?.refreshTokenExpiresAt) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
          }

          if (Date.now() > sessionData.val()?.expiresAt && Date.now() < sessionData.val()?.refreshTokenExpiresAt) {
            const refreshToken = sessionData.val()?.refreshToken;
            const tokenResponse = await getAccessToken({ refreshToken }, true);
            const tokenData = await tokenResponse.json();
            const newSessionId = await saveToken(tokenData);
            await removeSession(sessionId);
            return res.status(207).json({ sessionId: newSessionId });
          }
          break;
        case 403:
          return res.status(403).json({ error: 'Forbidden: You do not have access to this resource' });
        case 404:
          return res.status(404).json({ error: 'Not Found: The requested resource does not exist' });
        default:
          break;
      }
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