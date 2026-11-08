const express = require("express");
const cors = require("cors");
const config = require("./config");
const { notFound, errorHandler } = require("./middleware/errors");

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendUrl }));

app.use("/health", require("./routes/health"));
app.use("/equipment-types", require("./routes/types"));
app.use("/equipment", require("./routes/equipment"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;