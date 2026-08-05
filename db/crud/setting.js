const {getDB} = require("../init");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

function createRecoveryKey() {
    return crypto.randomBytes(12)
        .toString("hex")
        .toUpperCase()
        .match(/.{1,4}/g)
        .join("-");
}

function generateRecoveryKey() {
    const db = getDB();

    const recoveryKey = createRecoveryKey();
    const hash = bcrypt.hashSync(recoveryKey, 10);

    return new Promise((resolve, reject) => {

        db.run(`
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key)
            DO UPDATE SET value = excluded.value
        `,
        ["recovery_key", hash],
        function(err) {

            if (err) {
                return reject(err);
            }

            resolve({
                recoveryKey // Plain key shown only once
            });

        });

    });

}

function verifyRecovery(key) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT value
            FROM settings
            WHERE key = ?
            `,
            ["recovery_key"],
            async (err, settingRow) => {
                if (err) {
                    return reject(err);
                }

                if (!settingRow) {
                    return resolve({
                        success: false,
                        msg: "Kunci Pemulihan tidak ada"
                    });
                }

                const valid = await bcrypt.compare(
                    key,
                    settingRow.value
                );

                if (!valid) {
                    return resolve({
                        success: false,
                        msg: "Kunci tidak cocok"
                    });
                }
                
                db.get(
                    `
                    SELECT id
                    FROM users
                    WHERE role = ?
                    LIMIT 1
                    `,
                    ["admin"],

                    (err, userRow) => {

                        if (err) {
                            return reject(err);
                        }

                        if (!userRow) {
                            return resolve({
                                success: false,
                                msg: "Akun Admin tidak ditemukan"
                            });
                        }

                        resolve({
                            success: true,
                            msg: "Kunci terverifikasi",
                            userId: userRow.id
                        });

                    }
                );
              
            }
        );
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

module.exports = { 
    isSetupDone,
    finishSetup,
    generateRecoveryKey,
    verifyRecovery,
    deleteAllData 
};