const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS để cho phép các yêu cầu từ mọi nguồn
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Định nghĩa các API backend với tên tùy chỉnh
const API_BACKENDS = {
  'luckwin': 'https://api-luckwin-vannhat-bando.onrender.com',
  'game-tool': 'https://api-another-game.onrender.com',
  'other-api': 'https://example-api.onrender.com'
};

// Middleware proxy chung cho tất cả các backend
app.use('/:apiName/*', (req, res, next) => {
  const apiName = req.params.apiName;
  const targetUrl = API_BACKENDS[apiName];

  if (!targetUrl) {
    return res.status(404).send('API not found');
  }

  // Chuyển tiếp yêu cầu đến backend tương ứng
  proxy(targetUrl, {
    proxyReqPathResolver: (req) => {
      const path = req.originalUrl;
      const newPath = path.substring(`/${apiName}`.length);
      return newPath;
    },
    proxyReqOptDecorator: (proxyReqOpts, originalReq) => {
      // Đảm bảo host header được đặt đúng
      proxyReqOpts.headers['host'] = new URL(targetUrl).hostname;
      return proxyReqOpts;
    }
  })(req, res, next);
});

// Bắt đầu lắng nghe
app.listen(PORT, () => {
  console.log(`API Proxy listening on port ${PORT}`);
});
