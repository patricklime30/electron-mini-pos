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
                        message: "Username tidak cocok"
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

    return db.prepare(`
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
    `).run(data.username, password_hash, data.role);
}

function update(id, data) {
    const db = getDB();

    return db.prepare(`
        UPDATE users
        SET username = ?, password = ?
        WHERE id = ?
    `).run(data.username, data.password, id);
}

function remove(id) {
    const db = getDB();
    
    return db.prepare(`
        DELETE FROM users WHERE id = ?
    `).run(id);
}

module.exports = {
    getCredentials,
    create,
    update,
    remove
};