const { Pool } = require("pg");
const { parse } = require("pg-connection-string")
require("dotenv").config();

const config = parse(process.env.DATABASE_URL || "");

console.log("Database connection info:", config); // Confirm it's working


const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {rejectUnauthorized: false}
    
});

module.exports = pool;