

// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8003;
// app.get("/", (req, res) => {
//   res.send("Hello World! from services product docker");
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// })


import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());

const products = [
  { id: 1, name: "Laptop", price: 95000, stock: 12 },
  { id: 2, name: "Keyboard", price: 2500, stock: 30 },
  { id: 3, name: "Mouse", price: 1200, stock: 45 },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "product-service",
    gateway: req.get("x-gateway-instance") || "unknown",
    requestId: req.get("x-request-id") || null,
    count: products.length,
    data: products,
  });
});

app.get("/:id", (req, res) => {
  const product = products.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
      gateway: req.get("x-gateway-instance") || "unknown",
    });
  }

  res.json({
    success: true,
    service: "product-service",
    gateway: req.get("x-gateway-instance") || "unknown",
    data: product,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Product service running on ${PORT}`);
});
