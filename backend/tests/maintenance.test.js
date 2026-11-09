const { test } = require("node:test");
const assert = require("node:assert");
const {
    hoursSinceMaintenance,
    requiresMaintenance,
    withStatus,
} = require("../src/services/maintenance");

test("no requiere mantenimiento por debajo del intervalo", () => {
    assert.strictEqual(requiresMaintenance(499, 0, 500), false);
});

test("requiere mantenimiento al alcanzar exactamente el intervalo", () => {
    assert.strictEqual(requiresMaintenance(500, 0, 500), true);
});

test("requiere mantenimiento al superar el intervalo", () => {
    assert.strictEqual(requiresMaintenance(520, 0, 500), true);
});

test("el ciclo se reinicia tras un mantenimiento", () => {
    assert.strictEqual(requiresMaintenance(520, 520, 500), false);
    assert.strictEqual(hoursSinceMaintenance(520, 520), 0);
});

test("cuenta solo las horas desde el ultimo mantenimiento", () => {
    assert.strictEqual(requiresMaintenance(700, 300, 500), false);
    assert.strictEqual(requiresMaintenance(800, 300, 500), true);
});

test("withStatus devuelve el estado en español", () => {
    const needs = withStatus({ hourMeter: 300, lastMaintenanceHours: 0, intervalHours: 250 });
    assert.strictEqual(needs.status, "Requiere mantenimiento");
    assert.strictEqual(needs.requiresMaintenance, true);

    const ok = withStatus({ hourMeter: 100, lastMaintenanceHours: 0, intervalHours: 250 });
    assert.strictEqual(ok.status, "Operativo");
    assert.strictEqual(ok.requiresMaintenance, false);
});