const {getDB} = require("../init");
const bcrypt = require("bcrypt");

function getCredentials(username, password) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT id, username, password, role
            FROM users
            WHERE username = ?
            `,
            [username],
            async (err, row) => {
                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return resolve({
                        success: false,
                        message: "Akun tidak ditemukan"
                    });
                }

                const valid = await bcrypt.compare(
                    password,
                    row.password
                );

                if (!valid) {
                    return resolve({
                        success: false,
                        message: "Password tidak cocok"
                    });
                }

                resolve({
                    success: true,
                    user: {
                        id: row.id,
                        username: row.username,
                        role: row.role
                    }
                });
            }
        );
    });
}

function create(data) {
    const db = getDB();
    const password_hash = bcrypt.hashSync(data.password, 10);

    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (username, password, role)
            VALUES (?, ?, ?)
        `,
        [data.username, password_hash, data.role],
        function (err) {
            if (err) return reject(err);

            resolve({
                action: "Akun berhasil dibuat"
            });
        });

    });
}

function updateUsername(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        db.run(`
            UPDATE users
            SET username = ?
            WHERE id = ?
        `,
        [data.username, data.id],
        
        function (err) {
            if (err) return reject(err);

            db.get(
                `
                SELECT id, username, password, role
                FROM users
                WHERE id = ?
                `,
                [data.id],
                async (err, row) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        success: true,
                        msg: "Username berhasil diperbarui",
                        user: row
                    });
                }
            );
        });
        
    });

}

function verifyPassword(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT password
            FROM users
            WHERE id = ?
            `,
            [data.id],
            async (err, row) => {
                if (err) {
                    return reject(err);
                }

                if (!row) {
                    return resolve({
                        success: false,
                        message: "Akun tidak ditemukan"
                    });
                }

                const valid = await bcrypt.compare(
                    data.password,
                    row.password
                );

                if (!valid) {
                    return resolve({
                        success: false,
                        msg: "Password tidak cocok"
                    });
                }

                resolve({
                    success: true,
                    msg: "Password terverifikasi"
                });
            }
        );
    });
}

function resetPassword(data) {
    const db = getDB();

    const password_hash = bcrypt.hashSync(data.password, 10);

    return new Promise((resolve, reject) => {
        db.run(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [password_hash, data.id],
            function (err) {
                if (err) {
                    return reject(err);
                }

                if (this.changes === 0) {
                    return resolve({
                        success: false,
                        msg: "Akun tidak ditemukan"
                    });
                }

                resolve({
                    success: true,
                    msg: "Password berhasil diubah"
                });
            }
        );
    });
}

function remove(id) {
    const db = getDB();
    
    return new Promise((resolve, reject) => {
         db.run(
            `
            DELETE FROM users WHERE id = ?
            `,
            [id],
            function(err) {
                if (err) return reject(err);

                resolve({
                    message: "Toko berhasil dihapus",
                    changes: this.changes
                });
            }
        );
    });
}

module.exports = {
    getCredentials,
    create,
    updateUsername,
    verifyPassword,
    resetPassword,
    remove
};