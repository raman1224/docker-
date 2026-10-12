

// import express from "express";
// import { createServer } from "node:http";
// import { Server } from "socket.io";
// import { join, dirname } from "node:path";
// import { fileURLToPath } from "node:url";
// import { YSocketIO } from "y-socket.io/dist/server";

// const app = express();
// const server = createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Initialize Yjs collaboration
// const ySocketIO = new YSocketIO(io);
// ySocketIO.initialize();

// // Find the frontend build directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const frontendPath = join(__dirname, "../frontend/dist");

// // Serve React's production build
// app.use(express.static(frontendPath));

// // Send index.html for frontend routes
// app.get("/{*path}", (_req, res) => {
//   res.sendFile(join(frontendPath, "index.html"));
// });

// server.listen(3000, "0.0.0.0", () => {
//   console.log("Frontend and backend running on port 3000");
// });



import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize Yjs collaboration
const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();

// server.ts is located inside /app in the Docker container.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dockerfile copies the Vite build to /app/public
const frontendPath = join(__dirname, "public");

// Serve built HTML, JavaScript, CSS, and other assets
app.use(express.static(frontendPath));

// Handle frontend routes
app.get("/{*path}", (_req, res) => {
  res.sendFile(join(frontendPath, "index.html"));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Frontend and backend running on port 3000");
});

