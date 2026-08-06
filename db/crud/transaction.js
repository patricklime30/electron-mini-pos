const {getDB} = require("../init");

function createTransaction(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(
                `INSERT INTO transactions (subtotal, payment_method)
                 VALUES (?, ?)`,
                [data.total, data.paymentMethod],

                function (err) {

                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    const transactionId = this.lastID;
                  
                    const stmt = db.prepare(`
                        INSERT INTO transaction_items
                        (
                            transaction_id,
                            product_id,
                            quantity,
                            price,
                            total
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `);

                    for (const item of data.items) {

                        db.run(
                            `UPDATE products
                             SET stock = stock - ?
                             WHERE id = ?`,
                            [item.qty, item.id]
                        );
                        
                        stmt.run([
                            transactionId,
                            item.id,
                            item.qty,
                            item.price,
                            item.qty * item.price
                        ]);
                    }

                    stmt.finalize((err) => {

                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        db.run("COMMIT", (err) => {

                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }

                            resolve({
                                action: "Transaksi berhasil dibuat",
                                transaction_id: transactionId
                            });

                        });

                    });

                }
            );

        });

    });
}


// history purpose
function getAll() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT * FROM transactions ORDER BY id DESC
            `,
            [],
            (err, rows) => {
                if (err) return reject(err);

                resolve(rows);
            }
        );
    });
}

// summary
function getSummary(filterDate = "", filterPayment = "") {
    const db = getDB();

    return new Promise((resolve, reject) => {
        let whereClause = "";

        switch (filterDate) {
            case "today":
                whereClause = "WHERE DATE(created_at) = DATE('now', 'localtime')";
                break;

            case "yesterday":
                whereClause = "WHERE DATE(created_at) = DATE('now', '-1 day', 'localtime')";
                break;

            case "weekly":
                whereClause = `
                    WHERE DATE(created_at)
                    BETWEEN DATE('now', 'weekday 0', '-6 days', 'localtime')
                    AND DATE('now', 'localtime')
                `;
                break;

            case "monthly":
                whereClause = `
                    WHERE strftime('%Y-%m', created_at)
                    = strftime('%Y-%m', 'now', 'localtime')
                `;
                break;

            default:
                whereClause = "";
        }

        // Payment filter
        if (filterPayment) {
            whereClause += whereClause
                ? ` AND payment_method = '${filterPayment}'`
                : ` WHERE payment_method = '${filterPayment}'`;
        }

        db.get(
            `
            SELECT
                COUNT(*) AS totalTransactions,
                IFNULL(SUM(CASE WHEN payment_method='cash' THEN subtotal END), 0) AS totalCash,
                IFNULL(SUM(CASE WHEN payment_method='transfer' THEN subtotal END), 0) AS totalTransfer
            FROM transactions
            ${whereClause}
            `,
            [],
            (err, row) => {
                if (err) return reject(err);

                resolve(row);
            }
        );
    });
}

function getReceipt(transactionId) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        // 1. Get store information
        db.get(
            `
            SELECT *
            FROM stores
            LIMIT 1
            `,
            [],
            (err, store) => {

                if (err) return reject(err);

                // 2. Get transaction
                db.get(
                    `
                    SELECT *
                    FROM transactions
                    WHERE id = ?
                    `,
                    [transactionId],
                    (err, transaction) => {

                        if (err) return reject(err);

                        if (!transaction) {
                            return reject(new Error("Transaksi tidak ditemukan"));
                        }

                        // 3. Get all purchased items
                        db.all(
                            `
                            SELECT
                                ti.product_id,
                                p.name,
                                ti.quantity,
                                ti.price,
                                ti.total
                            FROM transaction_items ti
                            INNER JOIN products p
                                ON p.id = ti.product_id
                            WHERE ti.transaction_id = ?
                            `,
                            [transactionId],
                            (err, items) => {

                                if (err) return reject(err);

                                resolve({
                                    store,
                                    transaction,
                                    items
                                });

                            }
                        );

                    }
                );

            }
        );

    });
}

module.exports = {
    createTransaction,
    getAll,
    getSummary,
    getReceipt
};