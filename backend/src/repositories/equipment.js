const pool = require("../db/pool");

const SELECT_EQUIPMENT = `
  SELECT e.id,
         e.code,
         e.type_id AS "typeId",
         t.name AS "type",
         e.hour_meter::float AS "hourMeter",
         e.last_maintenance_hours::float AS "lastMaintenanceHours",
         t.maintenance_interval_hours AS "intervalHours",
         e.created_at AS "createdAt"
  FROM equipment e
  JOIN equipment_types t ON t.id = e.type_id
`;

async function list({ limit, offset }) {
    const { rows } = await pool.query(
        `${SELECT_EQUIPMENT} ORDER BY e.id LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    const { rows: count } = await pool.query(
        "SELECT COUNT(*)::int AS total FROM equipment"
    );
    return { rows, total: count[0].total };
}

async function findById(id) {
    const { rows } = await pool.query(`${SELECT_EQUIPMENT} WHERE e.id = $1`, [id]);
    return rows[0] || null;
}

async function create({ code, typeId, hourMeter }) {
    const { rows } = await pool.query(
        `INSERT INTO equipment (code, type_id, hour_meter, last_maintenance_hours)
     VALUES ($1, $2, $3, 0) RETURNING id`,
        [code, typeId, hourMeter]
    );
    return findById(rows[0].id);
}

async function update(id, { code, typeId, hourMeter }) {
    const { rows } = await pool.query(
        `UPDATE equipment SET code = $2, type_id = $3, hour_meter = $4
     WHERE id = $1 RETURNING id`,
        [id, code, typeId, hourMeter]
    );
    return rows.length ? findById(id) : null;
}

async function remove(id) {
    const { rowCount } = await pool.query("DELETE FROM equipment WHERE id = $1", [id]);
    return rowCount > 0;
}

async function registerMaintenance(id, notes) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query(
            "SELECT hour_meter FROM equipment WHERE id = $1 FOR UPDATE",
            [id]
        );
        if (!rows.length) {
            await client.query("ROLLBACK");
            return null;
        }
        const { rows: inserted } = await client.query(
            `INSERT INTO maintenance_history (equipment_id, hour_meter_at_service, notes)
       VALUES ($1, $2, $3)
       RETURNING id, equipment_id AS "equipmentId", performed_at AS "performedAt",
                 hour_meter_at_service::float AS "hourMeterAtService", notes`,
            [id, rows[0].hour_meter, notes ?? null]
        );
        await client.query(
            "UPDATE equipment SET last_maintenance_hours = hour_meter WHERE id = $1",
            [id]
        );
        await client.query("COMMIT");
        return { record: inserted[0], equipment: await findById(id) };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function listHistory(id) {
    const { rows } = await pool.query(
        `SELECT id, equipment_id AS "equipmentId", performed_at AS "performedAt",
            hour_meter_at_service::float AS "hourMeterAtService", notes
     FROM maintenance_history WHERE equipment_id = $1
     ORDER BY performed_at DESC, id DESC`,
        [id]
    );
    return rows;
}

async function listTypes() {
    const { rows } = await pool.query(
        `SELECT id, name, maintenance_interval_hours AS "intervalHours"
     FROM equipment_types ORDER BY id`
    );
    return rows;
}

module.exports = {
    list, findById, create, update, remove,
    registerMaintenance, listHistory, listTypes,
};