const { z } = require("zod");

const idParam = z.object({
    id: z.coerce
        .number({ error: "El id debe ser un numero" })
        .int({ error: "El id debe ser un entero" })
        .positive({ error: "El id debe ser positivo" }),
});

const listQuery = z.object({
    page: z.coerce
        .number({ error: "page debe ser un numero" })
        .int({ error: "page debe ser un entero" })
        .min(1, { error: "page debe ser al menos 1" })
        .default(1),
    limit: z.coerce
        .number({ error: "limit debe ser un numero" })
        .int({ error: "limit debe ser un entero" })
        .min(1, { error: "limit debe ser al menos 1" })
        .max(100, { error: "limit no puede ser mayor a 100" })
        .default(20),
});

const equipmentBody = z.object({
    code: z
        .string({ error: "El codigo es obligatorio" })
        .trim()
        .min(1, { error: "El codigo es obligatorio" })
        .max(30, { error: "El codigo no puede superar 30 caracteres" }),
    typeId: z
        .number({ error: "El tipo es obligatorio" })
        .int({ error: "El tipo no es valido" })
        .positive({ error: "El tipo no es valido" }),
    hourMeter: z
        .number({ error: "El horometro debe ser un numero" })
        .min(0, { error: "El horometro no puede ser negativo" }),
});

const maintenanceBody = z.object({
    notes: z
        .string({ error: "Las notas deben ser texto" })
        .trim()
        .max(500, { error: "Las notas no pueden superar 500 caracteres" })
        .optional(),
});

module.exports = { idParam, listQuery, equipmentBody, maintenanceBody };