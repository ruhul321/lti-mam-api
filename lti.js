require('dotenv').config();
const path = require("path");
const LTI = require("ltijs").Provider;
const fs = require('fs').promises;
const cors = require('cors');
const Cache = require('node-cache');
const crypto = require('crypto');
const express = require('express');
const mongoose = require("./config/db");

// API routes
const userRoutes = require("./routes/user.routes.js");
const mediaRoutes = require("./routes/media.routes.js");
const authRoutes = require("./routes/auth.routes.js");

// Initialize a cache for handoff tokens
const ltiContextCache = new Cache({ stdTTL: 60, checkperiod: 10 });

// Setup Ltijs
LTI.setup(
  process.env.LTI_KEY,
  {
    url: process.env.DATABASE_URL,
  },
  {
    appRoute: "/lti/launch",
    loginRoute: "/oidc/init",
    keysetRoute: "/.well-known/jwks.json",
    cookies: {
      secure: true,
      sameSite: "None",
    },
    devMode: false
  }
);

// Enable CORS and JSON parsing
LTI.app.use(cors());
LTI.app.use(express.json());

// Add backend API routes
LTI.app.use("/api/users", userRoutes);
LTI.app.use("/api/media", mediaRoutes);
LTI.app.use("/api/auth", authRoutes);

// // Default routes
// LTI.app.get("/", (req, res) => {
//   res.send(`Hello from LTI backend server`);
// });

// LTI.app.all("*", (req, res) => {
//   res.send(`Wrong Url`);
// });

// LTI Launch Handler
LTI.onConnect((token, req, res) => {
  console.log('token from onConnect', token);
  console.log("\u26A0\uFE0FonConnect Launch\u26A0\uFE0F");
  return res.sendFile(path.join(__dirname, "public/index.html"));
});

// Deep Linking Handler
LTI.onDeepLinking(async (token, req, res) => {
  console.log("\u26A0\uFE0F onDeepLinking Launch - Preparing to serve Loader Page \u26A0\uFE0F");
  try {
    const ltik = res.locals.ltik;
    if (!ltik) {
      console.error("FATAL: LTIK token was NOT found in res.locals. Cannot proceed.");
      return res.status(500).send("Could not generate a valid LTI session token.");
    }
    console.log("Successfully found ltik:", ltik);
    res.removeHeader('Cross-Origin-Embedder-Policy');

    const loaderPath = path.join(__dirname, "public/loader.html");
    console.log("Reading loader template from:", loaderPath);
    let loaderHtml = await fs.readFile(loaderPath, 'utf8');

    console.log("Replacing placeholder with actual ltik...");
    loaderHtml = loaderHtml.replace('__LTIK_TOKEN_PLACEHOLDER__', ltik);

    if (loaderHtml.includes('__LTIK_TOKEN_PLACEHOLDER__')) {
      console.error("FATAL: Replacement failed! Placeholder is still present in HTML.");
      return res.status(500).send("Failed to inject session token into the page.");
    } else {
      console.log("Placeholder successfully replaced.");
    }

    res.setHeader('Content-Type', 'text/html');
    return res.send(loaderHtml);

  } catch (err) {
    console.error("Error during onDeepLinking handler:", err);
    return res.status(500).send("A critical error occurred while initializing the tool.");
  }
});


  // ✅ Dev-only route to bypass LTI during local testing
  if (process.env.BYPASS_LTI === 'true') {
    // Mark route as whitelisted (bypasses LTIK authentication)
    LTI.whitelist('/test');
  
    LTI.app.get('/test', (req, res) => {
      res.send('✅ Test route working without LTI session');
    });
    // 🔁 Health route for cloud deployment
    LTI.whitelist('/health');
    LTI.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', uptime: process.uptime() });
    });
  }
  
// Start the LTI tool
const start = async () => {

  await LTI.deploy({ port: process.env.PORT || 3000 });

  await LTI.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: "Brightspace",
    clientId: process.env.CLIENT_ID,
    authenticationEndpoint: process.env.AUTH_URL,
    accesstokenEndpoint: process.env.TOKEN_URL,
    authConfig: { method: "JWK_SET", key: process.env.KEYSET_URL },
  });
};
start();
