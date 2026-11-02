

// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8001;
// app.get("/", (req, res) => {
//   res.send("Hello World! from services auth docker");
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// })


import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "auth-service",
    message: "Auth service received your request",
    gateway: req.get("x-gateway-instance") || "unknown",
    requestId: req.get("x-request-id") || null,
    features: ["login", "registration", "token validation"],
    note: "Demo only. Authentication is not implemented yet.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth service running on ${PORT}`);
});
