const {getDB} = require("../init");

function getAll() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT * FROM products ORDER BY id DESC
            `,
            [],
            (err, rows) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            }
        );
    });
}

function getById(id) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT * FROM products WHERE id = ?
            `,
            [id],
            (err, row) => {
                if (err) {
                    return reject(err);
                }

                resolve(row);
            }
        );
    });
}

function createOrUpdate(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        if (data.id) {
            // UPDATE
            db.run(
                `
                UPDATE products
                SET
                    name = ?,
                    price = ?,
                    stock = ?,
                    image = ?
                WHERE id = ?
                `,
                [
                    data.name,
                    data.price,
                    data.stock,
                    data.image,
                    data.id
                ],
                function(err) {
                    if (err) return reject(err);

                    resolve({
                        action: "Produk berhasil diperbarui",
                        id: data.id,
                        changes: this.changes
                    });
                }
            );

        } else {
            // INSERT
            db.run(
                `
                INSERT INTO products(name, price, stock, image)
                VALUES (?, ?, ?, ?)
                `,
                [
                    data.name,
                    data.price,
                    data.stock,
                    data.image
                ],
                function(err){
                    if (err) return reject(err);

                    resolve({
                        action: "Produk berhasil dibuat",
                        id: this.lastID
                    });
                }
            );

        }

    });
}

function remove(id) {
    const db = getDB();
    
    return new Promise((resolve, reject) => {
         db.run(
            `
            DELETE FROM products WHERE id = ?
            `,
            [id],
            function(err) {
                if (err) return reject(err);

                resolve({
                    message: "Produk berhasil dihapus",
                    changes: this.changes
                });
            }
        );
    });
   
}

module.exports = {
    getAll,
    getById,
    createOrUpdate,
    remove
};