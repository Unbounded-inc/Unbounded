const { Pool } = require("pg");
const { parse } = require("pg-connection-string");
require("dotenv").config();

const config = parse(process.env.DATABASE_URL || "");

console.log("Database connection info:", config); // ✅ helpful for debugging

const pool = new Pool({
    ...config,
    ssl: { rejectUnauthorized: false },
});

module.exports = pool;