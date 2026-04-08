/**
 * FILE: src/app.js
 * DESCRIPTION: Main Express server configuration, Middlewares, and Routes.
 */

const express = require("express");
const cors = require("cors");

const app = express();

// --- MIDDLEWARES ---

// Enable CORS for all requests (Essential for frontend communication)
app.use(cors()); 

// Support JSON-encoded bodies (Essential for POST/PATCH requests)
app.use(express.json()); 

// --- ROUTES ---

/**
 * Route Mapping:
 * /funcionarios -> CRUD for employee management
 * /ponto        -> Time clock operations and dashboard reports
 */
app.use("/funcionarios", require("./routes/funcionarios"));
app.use("/ponto", require("./routes/ponto"));

// Global error handling for non-existent routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
