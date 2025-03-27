const { Pool } = require("pg");
const { parse } = require("pg-connection-string")
require("dotenv").config();

const dbConfig = parse(process.env.DATABASE_URL);

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {rejectUnauthorized: false}
    
});

module.exports = pool;