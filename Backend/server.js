require("dotenv").config();
require("./src/config/validateEnv")();
const app = require("./app");
const http = require("http");
const { testConnection, closePool } = require("./lib/database");
const logger = require("./src/utils/logger");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
  try {
    logger.info('Starting server...');
    logger.info('Checking database connection...');

    const dbConnected = await testConnection(5, 2000);
    if (!dbConnected) {
      logger.error("Failed to connect to database after multiple attempts");
      logger.error("Server will not start. Please verify:");
      logger.error("  1. Your Supabase project is active");
      logger.error("  2. DATABASE_URL in .env is correct");
      logger.error("  3. Your internet connection is working");
      logger.error("  4. Run: node scripts/diagnose-db-connection.js for details");
      process.exit(1);
    }

    server.listen(port, "0.0.0.0", () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`API Documentation: http://0.0.0.0:${port}/api-docs`);
    });
  } catch (error) {
    logger.error("Server startup error", { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${port} is already in use`);
  } else {
    logger.error("Server error", { error });
  }
  process.exit(1);
});

// Single graceful shutdown handler (pool cleanup included)
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

startServer();
