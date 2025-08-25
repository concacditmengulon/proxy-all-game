const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Định nghĩa các API backend
const API_BACKENDS = {
  'luckwin': 'https://api-luckwin-vannhat-bando.onrender.com',
  'luckwinmd5': 'https://api-luckwin-vannhat-banhu-2.onrender.com/api/luckwin/vannhat'
  'sicbosun' : 'https://tele-idolvannhat-sicbo-sun.onrender.com/api/sicbo/vannhat'
};

// Hàm proxy chung cho tất cả các backend
const proxyMiddleware = (req, res, next) => {
  const apiName = req.params.apiName;
  const targetUrl = API_BACKENDS[apiName];

  if (!targetUrl) {
    return res.status(404).send('API not found');
  }

  // Tạo proxy cho API tương ứng
  const proxyHandler = proxy(targetUrl, {
    proxyReqPathResolver: (req) => {
      // Lấy phần đường dẫn còn lại sau tên API
      const url = require('url');
      const path = url.parse(req.originalUrl).path;
      const newPath = path.substring(`/${apiName}`.length);
      return newPath;
    },
    proxyReqOptDecorator: (proxyReqOpts, originalReq) => {
      // Thêm các headers cần thiết nếu có
      proxyReqOpts.headers['x-forwarded-for'] = originalReq.ip;
      return proxyReqOpts;
    }
  });

  proxyHandler(req, res, next);
};

// Sử dụng middleware proxy
app.use('/:apiName/*', proxyMiddleware);

app.listen(PORT, () => {
  console.log(`API Proxy listening on port ${PORT}`);
});
