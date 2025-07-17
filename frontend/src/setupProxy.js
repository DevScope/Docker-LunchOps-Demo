const { createProxyMiddleware } = require("http-proxy-middleware");

// module.exports = function(app) {
//   app.use(
//     "/api",
//     createProxyMiddleware({
//       target: REACT_APP_BACKEND_URL,
//       pathRewrite: { "^/api": "" }
//     })
//   );
// };
