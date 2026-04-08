/**
 * FILE: server.js
 * DESCRIPTION: Entry point of the O'Clock API. Initializes environment and starts the server.
 */

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pontoRoutes = require("./routes/ponto");

const app = express();
const PORT = process.env.PORT || 3001; // Uses environment variable or default 3001

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// Directs all /ponto calls to the time-tracking route file
app.use("/ponto", pontoRoutes);

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 O'CLOCK SERVER RUNNING ON http://localhost:${PORT}`);
});
