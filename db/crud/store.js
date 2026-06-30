const {getDB} = require("../init");

function getById(id) {
    const db = getDB();

    return db.prepare(`
        SELECT * FROM stores WHERE id = ?
    `).get(id);
}

function create(data) {
    const db = getDB();

    return db.prepare(`
        INSERT INTO stores (name, phone, address)
        VALUES (?, ?, ?)
    `).run(data.name, data.phone, data.address);
}

function update(id, data) {
    const db = getDB();

    return db.prepare(`
        UPDATE products
        SET name = ?, phone = ?, address = ?
        WHERE id = ?
    `).run(data.name, data.phone, data.address, id);
}

function remove(id) {
    const db = getDB();
    
    return db.prepare(`
        DELETE FROM stores WHERE id = ?
    `).run(id);
}

module.exports = {
    getById,
    create,
    update,
    remove
};