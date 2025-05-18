const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require("../database.js").db;

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        // Fetch all lists with their associated films
        db.all(`
            SELECT 
                list.id AS list_id, 
                list.name AS list_name, 
                list.user_id, 
                list.created_at, 
                film.id AS film_id, 
                film.title AS film_title, 
                film.description AS film_description, 
                film.release_date 
            FROM list
            LEFT JOIN list_film ON list.id = list_film.list_id
            LEFT JOIN film ON list_film.film_id = film.id
        `, [], (err, rows) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }

            // Group films by list
            const lists = rows.reduce((acc, row) => {
                const { list_id, list_name, user_id, created_at, film_id, film_title, film_description, release_date } = row;

                if (!acc[list_id]) {
                    acc[list_id] = {
                        id: list_id,
                        name: list_name,
                        user_id,
                        created_at,
                        films: []
                    };
                }

                if (film_id) {
                    acc[list_id].films.push({
                        id: film_id,
                        title: film_title,
                        description: film_description,
                        release_date
                    });
                }

                return acc;
            }, {});

            res.json(Object.values(lists));
        });
    } else {
        // Fetch a specific list with its associated films
        db.all(`
            SELECT 
                list.id AS list_id, 
                list.name AS list_name, 
                list.user_id, 
                list.created_at, 
                film.id AS film_id, 
                film.title AS film_title, 
                film.description AS film_description, 
                film.release_date 
            FROM list
            LEFT JOIN list_film ON list.id = list_film.list_id
            LEFT JOIN film ON list_film.film_id = film.id
            WHERE list.id = ?
        `, [id], (err, rows) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }

            if (rows.length === 0) {
                return res.status(404).send("<h1>List not found</h1>");
            }

            // Construct the list object with its films
            const { list_id, list_name, user_id, created_at } = rows[0];
            const list = {
                id: list_id,
                name: list_name,
                user_id,
                created_at,
                films: rows
                    .filter(row => row.film_id)
                    .map(row => ({
                        id: row.film_id,
                        title: row.film_title,
                        description: row.film_description,
                        release_date: row.release_date
                    }))
            };

            res.json(list);
        });
    }
});

// Create a new list
app.post("/", async (req, res) => {
    const { name, user_id } = req.body;

    // Check if all fields are provided
    if (!name || !user_id) {
        return res.status(400).send("<h1>Missing fields</h1>");
    }

    // Check if the user exists
    db.get("SELECT * FROM user WHERE id = ?", [user_id], (err, row) => {
        if (err) {
            return res.status(500).send("<h1>Error: </h1>" + err.message);
        }
        if (!row) {
            return res.status(400).send("<h1>User not found</h1>");
        }

        // Insert the new list into the database
        db.run("INSERT INTO list (name, user_id) VALUES (?, ?)", [name, user_id], (err) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            res.send("<h1>List created</h1>");
        });
    });
});

// Delete a list
app.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        // Delete all lists
        db.run("DELETE FROM list", [], (err) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            res.send("<h1>All lists deleted</h1>");
        });
    } else {
        // Delete a specific list
        db.run("DELETE FROM list WHERE id = ?", [id], (err) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            res.send("<h1>List deleted</h1>");
        });
    }
});

// Add a film to a list
app.post("/:list_id/film", async (req, res) => {
    const { list_id } = req.params;
    const { film_id } = req.body;

    // Check if all fields are provided
    if (!film_id) {
        return res.status(400).send("<h1>Missing film_id</h1>");
    }

    // Check if the list exists
    db.get("SELECT * FROM list WHERE id = ?", [list_id], (err, listRow) => {
        if (err) {
            return res.status(500).send("<h1>Error: </h1>" + err.message);
        }
        if (!listRow) {
            return res.status(400).send("<h1>List not found</h1>");
        }

        // Check if the film exists
        db.get("SELECT * FROM film WHERE id = ?", [film_id], (err, filmRow) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            if (!filmRow) {
                return res.status(400).send("<h1>Film not found</h1>");
            }

            // Insert the film into the list_film table
            db.run("INSERT INTO list_film (list_id, film_id) VALUES (?, ?)", [list_id, film_id], (err) => {
                if (err) {
                    return res.status(500).send("<h1>Error: </h1>" + err.message);
                }
                res.send("<h1>Film added to the list</h1>");
            });
        });
    });
});

// Remove a film from a list
app.delete("/:list_id/film/:film_id", async (req, res) => {
    const { list_id, film_id } = req.params;

    // Check if the list exists
    db.get("SELECT * FROM list WHERE id = ?", [list_id], (err, listRow) => {
        if (err) {
            return res.status(500).send("<h1>Error: </h1>" + err.message);
        }
        if (!listRow) {
            return res.status(400).send("<h1>List not found</h1>");
        }

        // Check if the film exists in the list
        db.get("SELECT * FROM list_film WHERE list_id = ? AND film_id = ?", [list_id, film_id], (err, listFilmRow) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            if (!listFilmRow) {
                return res.status(400).send("<h1>Film not found in the list</h1>");
            }

            // Remove the film from the list
            db.run("DELETE FROM list_film WHERE list_id = ? AND film_id = ?", [list_id, film_id], (err) => {
                if (err) {
                    return res.status(500).send("<h1>Error: </h1>" + err.message);
                }
                res.send("<h1>Film removed from the list</h1>");
            });
        });
    });
});

module.exports = app;