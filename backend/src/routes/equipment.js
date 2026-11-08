const express = require("express");
const service = require("../services/equipment");
const validate = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errors");
const v = require("../validation/equipment");

const router = express.Router();

router.get("/", validate(v.listQuery, "query"), asyncHandler(async (req, res) => {
    res.json(await service.list(req.valid.query));
}));

router.get("/:id", validate(v.idParam, "params"), asyncHandler(async (req, res) => {
    res.json(await service.get(req.valid.params.id));
}));

router.post("/", validate(v.equipmentBody), asyncHandler(async (req, res) => {
    res.status(201).json(await service.create(req.valid.body));
}));

router.put("/:id", validate(v.idParam, "params"), validate(v.equipmentBody), asyncHandler(async (req, res) => {
    res.json(await service.update(req.valid.params.id, req.valid.body));
}));

router.delete("/:id", validate(v.idParam, "params"), asyncHandler(async (req, res) => {
    await service.remove(req.valid.params.id);
    res.status(204).end();
}));

router.post("/:id/maintenance", validate(v.idParam, "params"), validate(v.maintenanceBody), asyncHandler(async (req, res) => {
    const result = await service.registerMaintenance(req.valid.params.id, req.valid.body.notes);
    res.status(201).json(result);
}));

router.get("/:id/maintenance", validate(v.idParam, "params"), asyncHandler(async (req, res) => {
    res.json(await service.history(req.valid.params.id));
}));

module.exports = router;