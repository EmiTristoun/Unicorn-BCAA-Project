const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require("../database.js").db;

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        db.all("SELECT * FROM film", [], (err, rows) => {
            if (err) {
                throw err;
            }
            res.json(rows);
        });
    }

    else {
        let exist = false;
        db.get("SELECT * FROM film WHERE id = ?", [id], (err, row) => {
            if (err) {
                throw err;
            }
            if (row) {
                exist = true;
                res.json(row);
            }

            if (!exist) {
                res.send("<h1>film not found</h1>");
            }
        });
    }
});

app.post("/", async (req, res) => {
    const { title, description, release_date } = req.body;

    // Check if all fields are provided
    if (!title || !description || !release_date) {
        return res.status(400).send("<h1>missing fields</h1>");
    }

    // insert the review in the database
    db.run("INSERT INTO film (title, description, release_date) VALUES (?, ?, ?)", [title, description, release_date], (err) => {
        if (err) {
            res.send("<h1>error : </h1>" + err.message);
        } else {
            res.send("<h1>film added to the database</h1>");
        }
    });
});

app.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        await db.run("DELETE FROM film", []);
        return res.send("<h1>all films deleted</h1>");
    }

    try {
        await db.run("DELETE FROM film WHERE id = ?", [id]);
        res.send("<h1>film deleted</h1>");
    } catch (err) {
        res.send("<h1>error : </h1>" + err.message);
    }
});

module.exports = app;