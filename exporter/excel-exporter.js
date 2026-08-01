const ExcelJS = require("exceljs");

async function exportOrders(orders, filePath) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Mini POS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Riwayat Transaksi");

  sheet.columns = [
    { header: "No", key: "id", width: 15 },
    { header: "Tanggal", key: "date", width: 20 },
    { header: "Payment", key: "payment", width: 15 },
    { header: "Total", key: "total", width: 15 }
  ];

  sheet.getRow(1).font = {
    bold: true
  };

  sheet.getRow(1).alignment = {
    horizontal: "center"
  };

  orders.forEach((order, idx) => {
    sheet.addRow({
      id: (idx + 1),
      date: order.created_at,
      payment: order.payment_method,
      total: order.subtotal
    });
  });

  sheet.getColumn("total").numFmt = '"Rp"#,##0';

  await workbook.xlsx.writeFile(filePath);
}

module.exports = {
  exportOrders
};
