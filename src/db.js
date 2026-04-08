/**
 * FILE: src/db.js
 * DESCRIPTION: Database connection pooling using environment variables.
 */

const { Pool } = require('pg');
require('dotenv').config(); // This loads the variables from your .env file

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// INITIAL CONNECTION TEST
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ Connection error:", err.message);
  });

module.exports = pool;
