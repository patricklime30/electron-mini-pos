const sql = require("sqlite3");
const path = require("path");

let db;

function initDB(app) {
    if(!db){
        const dbPath = path.join(app.getPath("userData"), "minipos.db");

        db = new sql.Database(dbPath);
    }

    return db;
}

function getDB() {
    return db;
}

module.exports = { initDB, getDB };