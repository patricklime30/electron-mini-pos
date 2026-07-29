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
    
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
        ["is_setup_done", 1],
        
        function (err){
            if (err) {
                return reject(err);
            }

            resolve({
                action: "Setup selesai dibuat"
            });

        });

    });
}

function deleteAllData(){
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.exec(`
            DELETE FROM products;
            DELETE FROM users;
            DELETE FROM transactions;
            DELETE FROM stores;
            DELETE FROM transaction_items;
            DELETE FROM settings;
        `,
        (err) => {
            if (err) {
                return reject(err);
            }

            resolve({
                msg: "Data telah terhapus"
            });

        });

    });
}

module.exports = { isSetupDone, finishSetup, deleteAllData };