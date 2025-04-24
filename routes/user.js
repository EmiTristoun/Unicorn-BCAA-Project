const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require("../database.js").db;

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        db.all("SELECT * FROM user", [], (err, rows) => {
            if (err) {
                throw err;
            }
            res.json(rows);
        });
    }

    else {
        let exist = false;
        db.get("SELECT * FROM user WHERE id = ?", [id], (err, row) => {
            if (err) {
                throw err;
            }
            if (row) {
                exist = true;
                res.json(row);
            }

            if (!exist) {
                res.send("<h1>user not found</h1>");
            }
        });
    }
});

app.post("/", async (req, res) => {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
        return res.status(400).send("<h1>missing fields</h1>");
    }

    // Check if the user already exists
    let exist = false;
    db.get("SELECT * FROM user WHERE email = ?", [email], (err, row) => {
        if (err) {
            throw err;
        }
        if (row) {
            exist = true;
        }
        if (!exist) {
            try {
                db.run("INSERT INTO user (name, email, password) VALUES (?, ?, ?)", [name, email, password]);
                res.send("<h1>user created</h1>");
            } catch (err) {
                res.send("<h1>error : </h1>" + err.message);
            };
        }
        else {
            res.send("<h1>user already exists</h1>");
        }
    });
});

app.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        await db.run("DELETE FROM user", []);
        return res.send("<h1>all users deleted</h1>");
    }

    try {
        await db.run("DELETE FROM user WHERE id = ?", [id]);
        res.send("<h1>user deleted</h1>");
    } catch (err) {
        res.send("<h1>error : </h1>" + err.message);
    }
});

module.exports = app;