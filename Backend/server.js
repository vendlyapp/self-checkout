require("dotenv").config();
const app = require("./app");
const http = require("http");
const { testConnection } = require("./lib/database");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
  try {
    console.log('🔄 Iniciando servidor...');
    console.log('🔄 Verificando conexión a la base de datos...');
    
    const dbConnected = await testConnection(5, 2000); // 5 reintentos, 2 segundos entre cada uno
    if (!dbConnected) {
      console.error("❌ No se pudo establecer conexión con la base de datos después de múltiples intentos");
      console.error("💡 El servidor no se iniciará. Verifica:");
      console.error("   1. Que tu proyecto de Supabase esté activo");
      console.error("   2. Que DATABASE_URL en .env sea correcto");
      console.error("   3. Que tu conexión a internet funcione");
      console.error("   4. Ejecuta: node scripts/diagnose-db-connection.js para más detalles");
      process.exit(1);
    }

    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📚 API Documentation: http://0.0.0.0:${port}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    console.error("   Stack:", error.stack);
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
