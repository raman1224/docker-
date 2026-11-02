

// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8002;
// app.get("/", (req, res) => {
//   res.send("Hello World! from services order docker");
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// })


import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());

const orders = [
  { id: 101, product: "Laptop", quantity: 1, status: "processing" },
  { id: 102, product: "Keyboard", quantity: 2, status: "shipped" },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "order-service",
    gateway: req.get("x-gateway-instance") || "unknown",
    requestId: req.get("x-request-id") || null,
    count: orders.length,
    data: orders,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Order service running on ${PORT}`);
});
