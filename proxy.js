const express = require('express');
const proxy = require('express-http-proxy');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ✅ Định nghĩa các API backend
const API_BACKENDS = {
  'luckwinmd5': 'https://api-luckwin-vannhat-bando.onrender.com',
  'luckwin': 'https://api-luckwin-vannhat-banhu-2.onrender.com',
  'hitclub': 'https://api-hitclub-aipro-vannhat.onrender.com',
  'sicbo-sun': 'https://tele-idolvannhat-sicbo-sun.onrender.com',
};

// ✅ Proxy middleware
app.use('/:apiName/*', (req, res, next) => {
  const apiName = req.params.apiName;
  const targetUrl = API_BACKENDS[apiName];

  if (!targetUrl) {
    return res.status(404).send('API not found');
  }

  proxy(targetUrl, {
    proxyReqPathResolver: (req) => {
      const path = req.originalUrl;
      const newPath = path.substring(`/${apiName}`.length);
      return newPath;
    },
    proxyReqOptDecorator: (proxyReqOpts) => {
      proxyReqOpts.headers['host'] = new URL(targetUrl).hostname;
      return proxyReqOpts;
    }
  })(req, res, next);
});

// ✅ Route test xem server sống chưa
app.get('/', (req, res) => {
  res.json({ status: "Proxy API running 🚀", time: new Date().toISOString() });
});

// ✅ Tự động ping chính nó mỗi 15 phút để Render không ngủ
setInterval(async () => {
  try {
    await axios.get(`http://localhost:${PORT}`);
    console.log("Ping OK ✅ - giữ server sống");
  } catch (err) {
    console.error("Ping lỗi ❌", err.message);
  }
}, 15 * 60 * 1000); // 15 phút

// ✅ Start server
app.listen(PORT, () => {
  console.log(`API Proxy listening on port ${PORT}`);
});
