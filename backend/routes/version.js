const express = require("express");
const app = express();

app.get("/", async (req, res) => {
    const { version } = require("../package.json");
    res.send(version);
});

module.exports = app;