const { Pool } = require("pg");
require("dotenv").config();
const { parse } = require("pg-connection-string");

const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };

const pool = new Pool(config);


const MAX_CONNECTIONS = 25;
const IDLE_THRESHOLD = 10;

const cleanupIdleConnections = async () => {
    try {
        const client = await pool.connect();

        const res = await client.query(`
      SELECT COUNT(*) FILTER (WHERE state = 'idle') AS idle,
             COUNT(*) AS total
      FROM pg_stat_activity
      WHERE usename = $1
    `, [process.env.PGUSER]);

        const { idle, total } = res.rows[0];
        const idleCount = parseInt(idle);
        const totalCount = parseInt(total);

        console.log(`[Monitor] Total: ${totalCount}, Idle: ${idleCount}`);

        if (idleCount >= IDLE_THRESHOLD) {
            console.log(`[Monitor] Cleaning up ${idleCount} idle connections...`);
            await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE state = 'idle'
          AND usename = $1
          AND pid <> pg_backend_pid()
      `, [process.env.PGUSER]);
        }

        client.release();
    } catch (err) {
        console.error("[Monitor] Error monitoring DB connections:", err.message);
    }
};

setInterval(cleanupIdleConnections, 30 * 1000);

console.log(" DB connection monitor is running...");
