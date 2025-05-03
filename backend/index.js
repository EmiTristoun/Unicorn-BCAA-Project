const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const db = require("./database.js").db;
//const cors = require("cors");

//app.use(cors()); // Enable CORS for all routes

app.use("/user", require("./routes/user"));
app.use("/review", require("./routes/review"));
app.use("/film", require("./routes/film"));
//app.use("/list", require("./routes/list"));

app.use("/version", require("./routes/version"));

app.listen(3001, () => {
    console.log("Hello! Server is running on port 3001");
});