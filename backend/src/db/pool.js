const { Pool } = require("pg");
const config = require("../config");

const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => console.error("Error inesperado en el pool:", err.message));

module.exports = pool;