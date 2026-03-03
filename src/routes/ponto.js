/**
 * ARQUIVO: routes/ponto.js
 * DESCRIÇÃO: Gestão de registros de ponto, painel administrativo e relatórios mensais.
 * DESCRIPTION: Management of time records, admin dashboard, and monthly reports.
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

// 0. CADASTRAR FUNCIONÁRIO | REGISTER EMPLOYEE
router.post("/funcionarios", async (req, res) => {
  const { nome, email, cargo } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO funcionarios (nome, email, cargo, ativo) VALUES ($1, $2, $3, true) RETURNING *",
      [nome, email, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar funcionário. Verifique se o e-mail já existe." });
  }
});

// 1. DESLIGAMENTO (SOFT DELETE) | TERMINATION (SOFT DELETE)
router.patch("/funcionarios/desligar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE funcionarios SET ativo = false WHERE id = $1", [id]);
    res.json({ mensagem: "Funcionário desligado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao desligar funcionário" });
  }
});

// 2. LISTAR INATIVOS | LIST INACTIVE EMPLOYEES
router.get("/funcionarios/inativos", async (req, res) => {
  try {
    const lista = await pool.query("SELECT * FROM funcionarios WHERE ativo = false ORDER BY nome ASC");
    res.json(lista.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar inativos" });
  }
});

// 3. PAINEL EM TEMPO REAL | REAL-TIME DASHBOARD
// Shows who is currently working or away
// Mostra quem está trabalhando no momento ou está fora
router.get("/painel-geral", async (req, res) => {
  try {
    const query = `
      SELECT f.id, f.nome, f.cargo, f.email,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM registros_ponto rp 
          WHERE rp.funcionario_id = f.id 
          AND rp.saida IS NULL
        ) THEN 'Trabalhando'
        ELSE 'Fora'
      END as status
      FROM funcionarios f
      WHERE f.ativo = true
      ORDER BY f.nome ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar painel" });
  }
});

// 4. REGISTRAR ENTRADA | CLOCK-IN
router.post("/entrada", async (req, res) => {
  const { funcionario_id } = req.body;
  try {
    // Check if there is already an open session
    // Verifica se já existe uma sessão em aberto
    const check = await pool.query(
      "SELECT * FROM registros_ponto WHERE funcionario_id = $1 AND saida IS NULL",
      [funcionario_id]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ erro: "Já existe uma entrada aberta." });
    }
    const novoPonto = await pool.query(
      "INSERT INTO registros_ponto (funcionario_id, entrada) VALUES ($1, NOW()) RETURNING *",
      [funcionario_id]
    );
    res.status(201).json(novoPonto.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao registrar entrada" });
  }
});

// 5. REGISTRAR SAÍDA | CLOCK-OUT
router.patch("/saida", async (req, res) => {
  const { funcionario_id } = req.body;
  try {
    const resultado = await pool.query(
      "UPDATE registros_ponto SET saida = NOW() WHERE funcionario_id = $1 AND saida IS NULL RETURNING *",
      [funcionario_id]
    );
    if (resultado.rows.length === 0) {
      return res.status(400).json({ erro: "Não há entrada aberta para este ID." });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao registrar saída" });
  }
});

// 6. RELATÓRIO MENSAL E CÁLCULO DE HORAS | MONTHLY REPORT & HOURS CALCULATION
router.get("/relatorio/:funcionario_id", async (req, res) => {
  const { funcionario_id } = req.params;
  try {
    const func = await pool.query("SELECT nome, ativo FROM funcionarios WHERE id = $1", [funcionario_id]);
    if (func.rows.length === 0) return res.status(404).json({ erro: "Funcionário não encontrado." });

    // 1. Current Month History | Histórico do Mês Atual
    const query = `
      SELECT id, entrada, saida, to_char(saida - entrada, 'HH24:MI:SS') AS duracao_formatada
      FROM registros_ponto 
      WHERE funcionario_id = $1 
      AND saida IS NOT NULL
      AND entrada >= date_trunc('month', CURRENT_DATE)
      ORDER BY entrada DESC
    `;
    const { rows } = await pool.query(query, [funcionario_id]);

    // 2. Total Hours Calculation (Robust method for > 24h)
    // Cálculo de Horas Totais (Método robusto para mais de 24h)
    const totalQuery = `
      SELECT 
        EXTRACT(EPOCH FROM SUM(saida - entrada)) as total_segundos
      FROM registros_ponto
      WHERE funcionario_id = $1 
      AND saida IS NOT NULL
      AND entrada >= date_trunc('month', CURRENT_DATE)
    `;
    const totalResult = await pool.query(totalQuery, [funcionario_id]);
    
    // Formatting seconds into HHh MMm | Formatando segundos para HHh MMm
    const segundos = totalResult.rows[0].total_segundos || 0;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const totalFormatado = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;

    res.json({
      funcionario: func.rows[0].nome,
      esta_ativo: func.rows[0].ativo,
      total_mes: totalFormatado, 
      historico: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao calcular horas" });
  }
});

module.exports = router;