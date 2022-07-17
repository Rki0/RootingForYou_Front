// client에서 request를 할 때 target에 있는 곳으로 보내겠다

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      // 설정된 서버 url 입력
      // target: "http://localhost:8000",
      target: "http://13.209.66.142:8000",
      changeOrigin: true,
    })
  );
};
