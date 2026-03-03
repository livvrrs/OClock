/**
 * ARQUIVO: src/db.js
 * DESCRIÇÃO: Configuração da conexão com o banco de dados PostgreSQL.
 * DESCRIPTION: PostgreSQL database connection configuration.
 */

const { Pool } = require("pg");
require("dotenv").config(); // Load environment variables | Carrega as variáveis de ambiente

/**
 * DATABASE CONNECTION POOL
 * We use a "Pool" to manage multiple simultaneous connections efficiently.
 * Utilizamos um "Pool" para gerenciar múltiplas conexões simultâneas de forma eficiente.
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Security Note: Credentials are kept in a .env file (hidden from GitHub)
  // Nota de Segurança: Credenciais são mantidas no arquivo .env (escondido do GitHub)
});

// INITIAL CONNECTION TEST | TESTE DE CONEXÃO INICIAL
pool.connect()
  .then(() => {
    console.log("Database connected successfully | Banco conectado com sucesso");
  })
  .catch(err => {
    console.error("Connection error | Erro ao conectar no banco:", err.message);
  });

module.exports = pool;