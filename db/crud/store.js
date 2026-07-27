const {getDB} = require("../init");

function getStore() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM stores LIMIT 1
        `,
        [],
        (err, row) => {
            if (err) return reject(err);

            resolve(row);
        });

    });
}

function create(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO stores (name, phone, address)
            VALUES (?, ?, ?)
        `,
        [data.name, data.phone, data.address],
        function (err) {
            if (err) return reject(err);

            resolve({
                action: "Toko berhasil dibuat"
            });
        });

    });
}

function update(id, data) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        db.run(`
            UPDATE products
            SET name = ?, phone = ?, address = ?
            WHERE id = ?
        `,
        [data.name, data.phone, data.address, id],
        
        function (err) {
            if (err) return reject(err);

            resolve({
                action: "Toko berhasil diperbarui",
                id: data.id,
                changes: this.changes
            });
        });
    });
}

function remove(id) {
    const db = getDB();

    return new Promise((resolve, reject) => {
         db.run(
            `
            DELETE FROM stores WHERE id = ?
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
    getStore,
    create,
    update,
    remove
};