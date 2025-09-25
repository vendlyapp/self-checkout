require("dotenv").config();
const app = require("./app");
const http = require("http");
const { testConnection } = require("./lib/database");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("Database connection failed");
      process.exit(1);
    }

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API Documentation: http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

const gracefulShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

startServer();
