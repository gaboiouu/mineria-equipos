const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "ok",
            database: "connected",
            commit: process.env.RENDER_GIT_COMMIT || null,
        });
    } catch (err) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});

module.exports = router;
