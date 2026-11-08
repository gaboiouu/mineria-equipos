function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos invalidos",
                details: result.error.issues.map((i) => ({
                    field: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        req.valid = { ...req.valid, [source]: result.data };
        next();
    };
}

module.exports = validate;