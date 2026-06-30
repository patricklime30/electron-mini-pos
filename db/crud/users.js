const {getDB} = require("../init");

const bcrypt = require("bcrypt");

function getAll(id) {
    const db = getDB();

    return db.prepare(`
        SELECT * FROM users ORDER BY role ASC
    `).get();
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
    getAll,
    create,
    update,
    remove
};