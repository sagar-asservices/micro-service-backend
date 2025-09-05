dotenv.config();
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createProxyMiddleware } from "http-proxy-middleware";
import authUser from "./middleware/auth.middleware.js";

const PORT = process.env.PORT || 5000;

const app = express();

// security middleware
app.use(helmet());

// allow cors origin
app.use(cors({ origin: "*" }));

// define custom token for full URL
morgan.token("fullUrl", function (req) {
  return req.protocol + "://" + req.get("host") + req.originalUrl;
});

// use it
app.use(morgan(":method :fullUrl :status :res[content-length] - :response-time ms"));

// compression
app.use(
  compression({
    level: 6,
    threshold: 1024
  })
);

// Static Files
app.use(
  express.static("public", {
    maxAge: "365d",
    etag: true,
    lastModified: true
  })
);

// Proxy rules
// user-service
app.use(
  "/users",
  authUser,
  createProxyMiddleware({
    target: "http://user_service:5001",
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      // ensure header is forwarded (proxy usually forwards req.headers automatically)
      if (req.headers["user_id"]) proxyReq.setHeader("user_id", req.headers["user_id"]);
    }
  })
);
// product-service
app.use(
  "/products",
  authUser,
  createProxyMiddleware({
    target: "http://product_service:5002",
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      // ensure header is forwarded (proxy usually forwards req.headers automatically)
      if (req.headers["user_id"]) proxyReq.setHeader("user_id", req.headers["user_id"]);
    }
  })
);
// order-service
app.use(
  "/orders",
  authUser,
  createProxyMiddleware({
    target: "http://order_service:5003",
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      // ensure header is forwarded (proxy usually forwards req.headers automatically)
      if (req.headers["user_id"]) proxyReq.setHeader("user_id", req.headers["user_id"]);
    }
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
