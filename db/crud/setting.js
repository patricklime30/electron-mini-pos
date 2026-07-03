const {getDB} = require("../init");

function isSetupDone() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT value
            FROM settings
            WHERE key = ?
            `,
            ["is_setup_done"],
            (err, row) => {
                if (err) {
                    return reject(err);
                }

                resolve(Number(row?.value) === 1);
            }
        );
    });
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