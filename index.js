const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const db = require("./database.js").db;

app.get("/", (req, res) => {
    res.send("<h1>I am OK!</h1>");
});

/* app.get("/a", (req, res) => {
    res.send("<h1>insert thing</h1>");
    db.run("INSERT INTO user (name, email, password) VALUES (?, ?, ?)", ["test", "svenkollenbach@gmail.com", "test"]);
});

app.get("/b", (req, res) => {
    res.send("<h1>get thing</h1>");
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows);
    });
});

app.get("/c", (req, res) => {
    res.send("<h1>delete thing</h1>");
    db.run("DROP TABLE IF EXISTS user", [], (err) => {
        if (err) {
            throw err;
        }
    });
}); */

app.use("/user", require("./routes/user"));
//app.use("/review", require("./routes/review"));
//app.use("/film", require("./routes/film"));
//app.use("/list", require("./routes/list"));

app.use("/version", require("./routes/version"));

app.listen(3001, () => {
    console.log("Hello! Server is running on port 3001");
});