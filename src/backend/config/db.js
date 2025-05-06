const { Pool } = require("pg");
const { parse } = require("pg-connection-string");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not defined in the environment!");
}

const config = parse(process.env.DATABASE_URL || "");

console.log("Database connection info:", {
    user: config.user,
    host: config.host,
    database: config.database,
    port: config.port,
});

const pool = new Pool({
    ...config,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

module.exports = pool;