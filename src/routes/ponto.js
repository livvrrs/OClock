/**
 * FILE: routes/ponto.js
 * DESCRIPTION: Core logic for time tracking, dashboard data, and reports.
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

// --- AUXILIARY FUNCTION TO CALCULATE MONTHLY HOURS ---
async function getHorasMes(funcionario_id) {
    const totalQuery = `
      SELECT SUM(saida - entrada) as interval
      FROM registros_ponto
      WHERE funcionario_id = $1 
      AND saida IS NOT NULL
      AND entrada >= date_trunc('month', CURRENT_DATE)
    `;
    const res = await pool.query(totalQuery, [funcionario_id]);
    const interval = res.rows[0].interval;

    if (!interval) return "00h 00m";

    // Format Postgres interval object to a user-friendly string
    const hours = interval.hours || 0;
    const minutes = interval.minutes || 0;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
}

// --- ROUTE FOR ADMIN DASHBOARD (REAL-TIME TEAM STATUS) ---
router.get("/painel-geral", async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id, 
                f.nome, 
                f.cargo,
                CASE 
                    WHEN rp.id IS NULL THEN 'Away'
                    WHEN rp.inicio_intervalo IS NOT NULL AND rp.fim_intervalo IS NULL THEN 'Lunch Break'
                    ELSE 'Working'
                END as status
            FROM funcionarios f
            LEFT JOIN registros_ponto rp ON f.id = rp.funcionario_id AND rp.saida IS NULL
            WHERE f.ativo = true
            ORDER BY f.nome ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error loading general dashboard." });
    }
});

// --- REGISTER NEW EMPLOYEE ---
router.post("/funcionarios", async (req, res) => {
    const { nome, email, cargo } = req.body;
    // Generate a random 6-character alphanumeric password
    const senhaGerada = Math.random().toString(36).slice(-6).toUpperCase();

    try {
        const result = await pool.query(
            "INSERT INTO funcionarios (nome, email, cargo, senha, ativo) VALUES ($1, $2, $3, $4, true) RETURNING *",
            [nome, email, cargo, senhaGerada]
        );
        res.status(201).json({ ...result.rows[0], senha: senhaGerada });
    } catch (err) {
        res.status(500).json({ error: "Error registering employee." });
    }
});

// --- CLOCK IN (WITH LOGIN VALIDATION) ---
router.post("/entrada", async (req, res) => {
    const { funcionario_id, senha } = req.body;

    try {
        // 1. Check if employee exists, is active and password matches
        const userCheck = await pool.query(
            "SELECT nome, cargo, senha, ativo FROM funcionarios WHERE id = $1",
            [funcionario_id]
        );

        if (userCheck.rows.length === 0) return res.status(404).json({ error: "ID not found." });
        
        const user = userCheck.rows[0];
        if (!user.ativo) return res.status(403).json({ error: "User is inactive." });
        if (user.senha !== senha) return res.status(401).json({ error: "Invalid password." });

        const totalHours = await getHorasMes(funcionario_id);

        // 2. Check for an already open shift
        const shiftCheck = await pool.query(
            "SELECT * FROM registros_ponto WHERE funcionario_id = $1 AND saida IS NULL",
            [funcionario_id]
        );

        if (shiftCheck.rows.length > 0) {
            // If already working, return data so frontend can update the UI
            return res.status(200).json({ 
                msg: "Already logged in", 
                nome: user.nome, 
                cargo: user.cargo,
                total_horas: totalHours,
                erro: "There is already an active shift for this ID."
            });
        }

        // 3. Register new entry
        await pool.query(
            "INSERT INTO registros_ponto (funcionario_id, entrada) VALUES ($1, NOW())",
            [funcionario_id]
        );

        res.status(201).json({ 
            nome: user.nome, 
            cargo: user.cargo,
            total_horas: totalHours
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during Clock In." });
    }
});

// --- CLOCK OUT (WITH PASSWORD VALIDATION) ---
router.patch("/saida", async (req, res) => {
    const { funcionario_id, senha } = req.body;
    try {
        const user = await pool.query("SELECT senha FROM funcionarios WHERE id = $1", [funcionario_id]);
        if (user.rows.length === 0 || user.rows[0].senha !== senha) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const result = await pool.query(
            "UPDATE registros_ponto SET saida = NOW() WHERE funcionario_id = $1 AND saida IS NULL RETURNING *",
            [funcionario_id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "No active shift found." });
        }
        res.json({ msg: "Clock out successful" });
    } catch (err) {
        res.status(500).json({ error: "Error during Clock Out." });
    }
});

// --- INDIVIDUAL REPORT (STATISTICS & HISTORY) ---
router.get("/relatorio/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query("SELECT nome, ativo FROM funcionarios WHERE id = $1", [id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const monthlyHours = await getHorasMes(id);

        // Recent history (last 10 entries)
        const history = await pool.query(`
            SELECT 
                entrada, 
                saida,
                to_char(entrada, 'MM/DD/YYYY HH24:MI') as formatted_date,
                CASE 
                    WHEN saida IS NOT NULL THEN 
                        to_char(saida - entrada, 'HH24"h "MI"m"')
                    ELSE 'In progress...'
                END as formatted_duration
            FROM registros_ponto 
            WHERE funcionario_id = $1 
            ORDER BY entrada DESC 
            LIMIT 10
        `, [id]);

        res.json({
            funcionario: user.rows[0].nome,
            esta_ativo: user.rows[0].ativo,
            total_mes: monthlyHours,
            historico: history.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching report" });
    }
});

// --- BREAK MANAGEMENT (START/END LUNCH BREAK) ---
router.patch("/intervalo", async (req, res) => {
    const { funcionario_id, senha } = req.body;
    try {
        const user = await pool.query("SELECT senha FROM funcionarios WHERE id = $1", [funcionario_id]);
        if (user.rows.length === 0 || user.rows[0].senha !== senha) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const point = await pool.query(
            "SELECT * FROM registros_ponto WHERE funcionario_id = $1 AND saida IS NULL", 
            [funcionario_id]
        );

        if (point.rows.length === 0) return res.status(400).json({ error: "Must Clock In first." });

        const { id, inicio_intervalo, fim_intervalo } = point.rows[0];

        if (!inicio_intervalo) {
            await pool.query("UPDATE registros_ponto SET inicio_intervalo = NOW() WHERE id = $1", [id]);
            return res.json({ message: "Break started!" });
        } else if (!fim_intervalo) {
            await pool.query("UPDATE registros_ponto SET fim_intervalo = NOW() WHERE id = $1", [id]);
            return res.json({ message: "Break ended!" });
        } else {
            return res.status(400).json({ error: "Break already used." });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- DEACTIVATE EMPLOYEE (SOFT DELETE/DISMISSAL) ---
router.patch("/funcionarios/desligar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE funcionarios SET ativo = false WHERE id = $1", [id]);
        res.json({ msg: "Employee successfully deactivated." });
    } catch (err) {
        res.status(500).json({ error: "Error deactivating employee." });
    }
});

// --- GET ARCHIVED (INACTIVE) EMPLOYEES ---
router.get("/funcionarios/arquivados", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, nome, cargo FROM funcionarios WHERE ativo = false ORDER BY nome ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error fetching archived employees." });
    }
});

module.exports = router;
