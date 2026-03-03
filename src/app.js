/**
 * ARQUIVO: src/app.js (ou server.js)
 * DESCRIÇÃO: Configuração principal do servidor Express, Middlewares e Rotas.
 * DESCRIPTION: Main Express server configuration, Middlewares, and Routes.
 */

const express = require("express");
const cors = require("cors");

const app = express();

// --- MIDDLEWARES ---

// Enable CORS for all requests (Essential for frontend communication)
// Habilita o CORS para todas as requisições (Essencial para comunicação com o frontend)
app.use(cors()); 

// Support JSON-encoded bodies (Essential for POST/PATCH requests)
// Suporte para corpos de requisição em formato JSON (Essencial para POST/PATCH)
app.use(express.json()); 

// --- ROUTES / ROTAS ---

/**
 * Route Mapping / Mapeamento de Rotas
 * /funcionarios: CRUD for employees | Gestão de funcionários
 * /ponto: Time clock operations and reports | Operações de ponto e relatórios
 */
app.use("/funcionarios", require("./routes/funcionarios"));
app.use("/ponto", require("./routes/ponto"));

// Error handling for non-existent routes (Optional but good practice)
// Tratamento de erro para rotas inexistentes (Opcional, mas boa prática)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found | Rota não encontrada" });
});

module.exports = app;