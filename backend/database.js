const sqlite3 = require('sqlite3').verbose();
let sql;


const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

function createTables(db) {
    //create the tables if they do not exist
    //create the user table
    sql = `CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    db.run(sql, [], (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Created the table.');
    });

    //create the review table
    sql = `CREATE TABLE IF NOT EXISTS review (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        film_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        review TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user (id),
        FOREIGN KEY (film_id) REFERENCES film (id)
    )`;

    db.run(sql, [], (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Created the table.');
    });

    //create the film table
    sql = `CREATE TABLE IF NOT EXISTS film (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        release_date DATE NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.run(sql, [], (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Created the table.');
    });

    //create the list table
    sql = `CREATE TABLE IF NOT EXISTS list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        film_id INTEGER ,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user (id),
        FOREIGN KEY (film_id) REFERENCES film (id)
    )`;
}

createTables(db);


module.exports = {db};