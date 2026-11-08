class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
    res.status(404).json({ error: "Ruta no encontrada" });
}

function errorHandler(err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON invalido" });
    }
    if (err.code === "23505") {
        return res.status(409).json({ error: "Ya existe un equipo con ese codigo" });
    }
    if (err.code === "23503") {
        return res.status(400).json({ error: "El tipo de equipo no existe" });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = { HttpError, asyncHandler, notFound, errorHandler };