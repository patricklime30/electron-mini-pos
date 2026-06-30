const {getDB} = require("../init");

function createTransaction(subtotal, payment_method) {
    const db = getDB();

    return db.prepare(`
        INSERT INTO transactions (subtotal, payment_method)
        VALUES (?, ?)
    `).run(subtotal, payment_method);
}

function addItem(transaction_id, item) {
    const db = getDB();

    return db.prepare(`
        INSERT INTO transaction_items (
            transaction_id,
            product_id,
            quantity,
            price,
            total
        )
        VALUES (?, ?, ?, ?, ?)
    `).run(
        transaction_id,
        item.product_id,
        item.quantity,
        item.price,
        item.quantity * item.price
    );
}

function getAll() {
    const db = getDB();

    return db.prepare(`
        SELECT * FROM transactions
        ORDER BY date DESC
    `).all();
}

function getItems(transaction_id) {
    const db = getDB();

    return db.prepare(`
        SELECT
            ti.*,
            p.name
        FROM transaction_items ti
        JOIN products p ON p.id = ti.product_id
        WHERE ti.transaction_id = ?
    `).all(transaction_id);
}

function getByDate(days) {
    const db = getDB();
    
    return db.prepare(`
        SELECT *
        FROM transactions
        WHERE date >= datetime('now', ?)
        ORDER BY date DESC
    `).all(`-${days} days`);
}

module.exports = {
    createTransaction,
    addItem,
    getAll,
    getItems,
    getByDate
};