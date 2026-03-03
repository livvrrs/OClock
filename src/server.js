/**
 * ARQUIVO: server.js
 * DESCRIÇÃO: Ponto de entrada da aplicação. Inicializa o servidor e define as rotas base.
 * DESCRIPTION: Application entry point. Initializes the server and defines base routes.
 */

const express = require("express");
const cors = require("cors");
const pontoRoutes = require("./src/routes/ponto"); // Ensure path is correct | Garanta que o caminho está correto

const app = express();
const PORT = process.env.PORT || 3001; // Uses env port or default 3001 | Usa porta do env ou 3001 padrão

// --- MIDDLEWARES ---

// CORS: Allows the frontend to communicate with the API
// CORS: Permite que o frontend se comunique com a API
app.use(cors());

// JSON: Allows the server to understand data sent in JSON format
// JSON: Permite que o servidor entenda dados enviados em formato JSON
app.use(express.json()); 

// --- ROUTES / ROTAS ---

/**
 * All endpoints inside pontoRoutes will be prefixed with /ponto
 * Todos os endpoints dentro de pontoRoutes terão o prefixo /ponto
 * Example: /ponto/entrada, /ponto/relatorio/:id
 */
app.use("/ponto", pontoRoutes);

// --- SERVER INITIALIZATION / INICIALIZAÇÃO ---

app.listen(PORT, () => {
  console.log(`
  🚀 SERVER RUNNING | SERVIDOR RODANDO
  ------------------------------------
  Local: http://localhost:${PORT}
  Mode: Development
  ------------------------------------
  `);
});

// Export for testing purposes | Exportar para fins de teste
module.exports = app;