// routes/search.routes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Access token will be cached temporarily (optional optimization)
let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  const now = Date.now();

  // If token is valid, reuse it
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post('https://int.mcmedia.mayo.edu/webapi/security/clientcredentialsauthentication/authenticate_46H_v1', {
      client_id: process.env.MAM_CLIENT_ID,
      client_secret: process.env.MAM_CLIENT_SECRET,
      grant_type:"client_credentials"
    });

    const token = response.data?.accessToken;
    const expiresIn = response.data?.expiresInSeconds || 3600; // default to 1 hour

    if (!token) {
      throw new Error('No access token received from MAM auth endpoint');
    }

    // Cache the token
    cachedToken = token;
    tokenExpiry = now + (expiresIn * 1000) - 60000; // refresh 1 minute before expiry

    return token;
  } catch (err) {
    console.error('❌ Error getting MAM access token:', err.message);
    throw err;
  }
}

router.get('/', async (req, res) => {
  const { query, pagenumber = 1, countperpage = 10 } = req.query;

  try {
    const accessToken = await getAccessToken();

    const response = await axios.get('https://int.mcmedia.mayo.edu/API/search/v4.0/search', {
      params: {
        query,
        format: 'json',
        pagenumber,
        countperpage,
        fields: 'SystemIdentifier,Title,Path_TR7',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('❌ Search API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

module.exports = router;
