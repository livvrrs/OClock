/**
 * ARQUIVO: routes/funcionarios.js
 * DESCRIÇÃO: Rotas para gestão de funcionários (CRUD).
 * DESCRIPTION: Routes for employee management (CRUD).
 * * Estratégia/Strategy: Soft Delete (ativo/active).
 */

const express = require("express");
const pool = require("../db");
const router = express.Router();

// 1. CADASTRAR NOVO FUNCIONÁRIO | REGISTER NEW EMPLOYEE
// POST /ponto/funcionarios
router.post("/", async (req, res) => {
  const { nome, email, cargo } = req.body;
  try {
    // Default 'ativo' to true so employee can start immediately
    // Definimos 'ativo' como true para início imediato
    const result = await pool.query(
      "INSERT INTO funcionarios (nome, email, cargo, ativo) VALUES ($1, $2, $3, true) RETURNING *",
      [nome, email, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error on signup:", err.message);
    // Handling duplicate email error (UNIQUE constraint)
    // Tratamento de erro para e-mail duplicado
    res.status(500).json({ error: "Erro ao cadastrar: Verifique se o e-mail já existe." });
  }
});

// 2. LISTAR FUNCIONÁRIOS ATIVOS | LIST ACTIVE EMPLOYEES
// GET /ponto/funcionarios
router.get("/", async (req, res) => {
  try {
    // Return only active employees in alphabetical order
    // Retorna apenas funcionários ativos em ordem alfabética
    const result = await pool.query(
      "SELECT * FROM funcionarios WHERE ativo = true ORDER BY nome ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

// 3. BUSCAR POR ID | SEARCH BY ID
// GET /ponto/funcionarios/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM funcionarios WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar funcionário" });
  }
});

// 4. DESATIVAR (SOFT DELETE) | DEACTIVATE (SOFT DELETE)
// DELETE /ponto/funcionarios/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Preserve history by changing status instead of deleting
    // Preserva o histórico mudando o status em vez de deletar
    await pool.query("UPDATE funcionarios SET ativo = false WHERE id = $1", [id]);
    res.json({ message: "Funcionário desativado (histórico preservado)" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao desativar funcionário" });
  }
});

module.exports = router;