const { z } = require("zod");

const idParam = z.object({ id: z.coerce.number().int().positive() });

const listQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

const equipmentBody = z.object({
    code: z.string().trim().min(1).max(30),
    typeId: z.number().int().positive(),
    hourMeter: z.number().min(0),
});

const maintenanceBody = z.object({
    notes: z.string().trim().max(500).optional(),
});

module.exports = { idParam, listQuery, equipmentBody, maintenanceBody };