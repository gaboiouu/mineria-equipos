const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../../.env"),
    quiet: true,
});

const required = ["DATABASE_URL"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(", ")}`);
    process.exit(1);
}

module.exports = {
    databaseUrl: process.env.DATABASE_URL,
    port: Number(process.env.PORT) || 3000,
    frontendUrl: process.env.FRONTEND_URL || "*",
};