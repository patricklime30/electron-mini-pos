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

function update(data) {
    const db = getDB();

    return new Promise((resolve, reject) => {

        db.run(`
            UPDATE stores
            SET name = ?, phone = ?, address = ?
            WHERE id = ?
        `,
        [data.name, data.phone, data.address, data.id],
        
        function (err) {
            if (err) return reject(err);

            resolve({
                msg: "Toko berhasil diperbarui",
                id: data.id,
                success: true
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