const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require("../database.js").db;

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (id === '*') {
        db.all("SELECT id, name, email FROM user", [], (err, rows) => {
            if (err) {
                throw err;
            }
            res.json(rows);
        });
    }

    else {
        let exist = false;
        db.get("SELECT id, name, email FROM user WHERE id = ?", [id], (err, row) => {
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
        return res.status(400).send("<h1>Missing fields</h1>");
    }

    // Check if the user already exists
    db.get("SELECT * FROM user WHERE email = ?", [email], async (err, row) => {
        if (err) {
            return res.status(500).send("<h1>Error: </h1>" + err.message);
        }
        if (row) {
            return res.status(400).send("<h1>User already exists</h1>");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        db.run("INSERT INTO user (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            res.send("<h1>User created</h1>");
        });
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

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).send("<h1>Missing email or password</h1>");
    }

    // Check if the user exists
    db.get("SELECT * FROM user WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).send("<h1>Error: </h1>" + err.message);
        }
        if (!user) {
            return res.status(404).send("<h1>User not found</h1>");
        }

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send("<h1>Error: </h1>" + err.message);
            }
            if (!isMatch) {
                return res.status(401).send(user.password);
            }

            // Generate a JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, "your_secret_key", { expiresIn: "1h" });

            res.json({ message: "Login successful", token });
        });
    });
});

module.exports = app;