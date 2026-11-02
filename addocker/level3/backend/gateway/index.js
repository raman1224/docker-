

// import express from "express";
// import dotenv from "dotenv";
// import proxy from "express-http-proxy";
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(express.json())
// app.get("/", (req, res) => {
//   res.send(`Hello World! from ${process.env.SERVER_NAME}`);
// });


// app.use("/auth", proxy("http://auth-service:8001"))
// app.use("/order", proxy("http://order-service:8002"))
// app.use("/product", proxy("http://product-service:8003"))

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// })


import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import { randomUUID } from "node:crypto";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;
const SERVER_NAME = process.env.SERVER_NAME || "gateway-unknown";

app.use(express.json());

// Nginx supplies a request ID.
// Generate one if the request came from somewhere else.
app.use((req, res, next) => {
  req.requestId = req.get("x-request-id") || randomUUID();

  res.setHeader("X-Request-ID", req.requestId);
  res.setHeader("X-Gateway-Instance", SERVER_NAME);

  console.log({
    requestId: req.requestId,
    gateway: SERVER_NAME,
    method: req.method,
    path: req.originalUrl,
  });

  next();
});

// Gateway health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    gateway: SERVER_NAME,
    requestId: req.requestId,
  });
});

// Use this endpoint to observe Nginx load balancing.
app.get("/gateway", (req, res) => {
  res.json({
    success: true,
    gateway: SERVER_NAME,
    requestId: req.requestId,
    message: "Nginx selected this gateway instance",
    timestamp: new Date().toISOString(),
  });
});

// Forward gateway identity and request ID to downstream services.
function createProxy(target) {
  return proxy(target, {
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      proxyReqOpts.headers = {
        ...proxyReqOpts.headers,
        "x-gateway-instance": SERVER_NAME,
        "x-request-id": srcReq.requestId,
      };

      return proxyReqOpts;
    },
  });
}

// API Gateway routing
app.use("/auth", createProxy("http://auth-service:8001"));
app.use("/product", createProxy("http://product-service:8003"));
app.use("/order", createProxy("http://order-service:8002"));

// Return a useful error if a downstream service fails.
app.use((err, req, res, next) => {
  console.error("Gateway error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(502).json({
    success: false,
    error: "Upstream service unavailable",
    gateway: SERVER_NAME,
    requestId: req.requestId,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${SERVER_NAME} listening on port ${PORT}`);
});
