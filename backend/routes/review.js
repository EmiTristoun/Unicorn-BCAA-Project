const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require("../database.js").db;

app.get("/:id", async (req, res) => {
    const { id } = req.params;
    const film_id = req.query.film_id;

    if (id === "*") {
        if (!film_id) {
            db.all("SELECT * FROM review", [], (err, rows) => {
                if (err) {
                    throw err;
                }
                res.json(rows);
            });
        }
        else {
            db.all("SELECT * FROM review WHERE film_id = ?", [film_id], (err, rows) => {
                if (err) {
                    throw err;
                }
                res.json(rows);
            });
        }
    }

    else {
        let exist = false;
        db.get("SELECT * FROM review WHERE id = ?", [id], (err, row) => {
            if (err) {
                throw err;
            }
            if (row) {
                exist = true;
                res.json(row);
            }

            if (!exist) {
                res.send("<h1>review not found</h1>");
            }
        });
    }
});

app.post("/", async (req, res) => {
    const { user_id, film_id, rating, review } = req.body;

    // Check if all fields are provided
    if (!user_id || !film_id || !rating || !review) {
        return res.status(400).send("<h1>missing fields</h1>");
    }

    //check that all fields are valid
    if (rating < 1 || rating > 5) {
        return res.status(400).send("<h1>rating must be between 1 and 5</h1>");
    }

    // check if user_id is valid
    const userExists = await (async () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM user WHERE id = ?", [user_id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(!!row); // user found if row exists
            });
        });
    })();

    if (!userExists) {
        return res.status(400).send("<h1>user not found</h1>");
    }

    // now same thing for film_id
    const filmExists = await (async () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM film WHERE id = ?", [film_id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(!!row); // user found if row exists
            });
        });
    })();

    if (!filmExists) {
        return res.status(400).send("<h1>film not found</h1>");
    }
    
    //check if a review already exists for this user and film
    const reviewExists = await (async () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM review WHERE user_id = ? AND film_id = ?", [user_id, film_id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(!!row); // review found if row exists
            });
        });
    })();

    if (reviewExists) {
        // if a review already exists, we don't want to create a new one
        return res.status(400).send("<h1>review already exists</h1>");
    }
    // insert the review in the database
    db.run("INSERT INTO review (user_id, film_id, rating, review) VALUES (?, ?, ?, ?)", [user_id, film_id, rating, review], (err) => {
        if (err) {
            res.send("<h1>error : </h1>" + err.message);
        }
        else {
            res.send("<h1>review created</h1>");
        }
    });
});

app.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const film_id = req.body.film_id;

    if (id === '*') {
        if (!film_id) {
            return res.status(400).send("<h1>missing film_id</h1>");
        }
        await db.run("DELETE FROM review WHERE film_id = ?", [film_id]);
        return res.send("<h1>all reviews deleted for film with id n° </h1>" + film_id);
    }

    try {
        await db.run("DELETE FROM review WHERE id = ?", [id]);
        res.send("<h1>review deleted</h1>");
    } catch (err) {
        res.send("<h1>error : </h1>" + err.message);
    }
});

module.exports = app;