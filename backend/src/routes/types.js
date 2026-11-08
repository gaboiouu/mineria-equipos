const express = require("express");
const service = require("../services/equipment");
const { asyncHandler } = require("../middleware/errors");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
    res.json(await service.listTypes());
}));

module.exports = router;