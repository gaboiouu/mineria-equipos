const round1 = (n) => Math.round(n * 10) / 10;

function hoursSinceMaintenance(hourMeter, lastMaintenanceHours) {
    return round1(Math.max(0, hourMeter - lastMaintenanceHours));
}

function requiresMaintenance(hourMeter, lastMaintenanceHours, intervalHours) {
    return hoursSinceMaintenance(hourMeter, lastMaintenanceHours) >= intervalHours;
}

function withStatus(equipment) {
    const needs = requiresMaintenance(
        equipment.hourMeter,
        equipment.lastMaintenanceHours,
        equipment.intervalHours
    );
    return {
        ...equipment,
        hoursSinceMaintenance: hoursSinceMaintenance(
            equipment.hourMeter,
            equipment.lastMaintenanceHours
        ),
        requiresMaintenance: needs,
        status: needs ? "Requiere mantenimiento" : "Operativo",
    };
}

module.exports = { hoursSinceMaintenance, requiresMaintenance, withStatus };