const {getDB} = require("../init");

function getAll() {
    const db = getDB();

    return db.prepare(`
        SELECT * FROM products ORDER BY id DESC
    `).all();
}

function getById(id) {
    const db = getDB();

    return db.prepare(`
        SELECT * FROM products WHERE id = ?
    `).get(id);
}

function create(data) {
    const db = getDB();

    return db.prepare(`
        INSERT INTO products (image, name, price, stock)
        VALUES (?, ?, ?, ?)
    `).run(data.image, data.name, data.price, data.stock);
}

function update(id, data) {
    const db = getDB();

    return db.prepare(`
        UPDATE products
        SET image = ?, name = ?, price = ?, stock = ?
        WHERE id = ?
    `).run(data.image, data.name, data.price, data.stock, id);
}

function updateStock(id, qty) {
    const db = getDB();

    return db.prepare(`
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
    `).run(qty, id);
}

function remove(id) {
    const db = getDB();
    
    return db.prepare(`
        DELETE FROM products WHERE id = ?
    `).run(id);
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    updateStock,
    remove
};