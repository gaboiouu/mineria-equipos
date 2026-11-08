const repo = require("../repositories/equipment");
const { HttpError } = require("../middleware/errors");
const { withStatus } = require("./maintenance");

const notFound = () => new HttpError(404, "Equipo no encontrado");

async function list({ page, limit }) {
    const { rows, total } = await repo.list({ limit, offset: (page - 1) * limit });
    return { data: rows.map(withStatus), page, limit, total };
}

async function get(id) {
    const equipment = await repo.findById(id);
    if (!equipment) throw notFound();
    return withStatus(equipment);
}

async function create(data) {
    return withStatus(await repo.create(data));
}

async function update(id, data) {
    const equipment = await repo.update(id, data);
    if (!equipment) throw notFound();
    return withStatus(equipment);
}

async function remove(id) {
    if (!(await repo.remove(id))) throw notFound();
}

async function registerMaintenance(id, notes) {
    const result = await repo.registerMaintenance(id, notes);
    if (!result) throw notFound();
    return { record: result.record, equipment: withStatus(result.equipment) };
}

async function history(id) {
    await get(id);
    return repo.listHistory(id);
}

const listTypes = () => repo.listTypes();

module.exports = { list, get, create, update, remove, registerMaintenance, history, listTypes };