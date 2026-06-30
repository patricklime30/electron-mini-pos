const {getDB} = require("../init");

function isSetupDone() {
    const db = getDB();

    const row = db.prepare(`
        SELECT value FROM settings WHERE key = ?
    `).get('is_setup_done');

    return Number(row?.value) === 1;
}

function finishSetup() {
    const db = getDB();
    
    db.prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run("is_setup_done", 1);
}

module.exports = { isSetupDone, finishSetup };