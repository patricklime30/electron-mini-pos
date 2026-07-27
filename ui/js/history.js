const modalReceipt = "receiptModal";

let receiptModal = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.api.getCurrentUser();

    if(!user)
        return;

    Navbar.init();

    const receiptUI = await fetch("../pages/receipt.html").then(r => r.text());

    // create receipt modal
    receiptModal = Modal.init({
            id: modalReceipt,
            title: "Resi Pesanan",
            subtitle: "",
            body: receiptUI,
            footer: `
                <button class="btn-primary" id="printReceiptBtn">
                    Print
                </button>

                <button
                    class="btn-secondary"
                    id="cancelReceiptBtn">
                    Tutup
                </button>
            `
        });

    if(receiptModal){
        // click cancel Receipt modal
        document.getElementById("cancelReceiptBtn").addEventListener("click", () => {

             Modal.close(modalReceipt);
        });
    }

    loadTransactions();
    loadSummary();
});

// load transaction table
async function loadTransactions(){

    const transactions = await window.api.getAllTransaction();

    const tbody = document.getElementById("transactionTable");

    tbody.innerHTML = "";

    transactions.forEach((trans, idx )=>{

        const paymentClass =
            trans.payment_method === "cash"
                ? "payment-cash"
                : "payment-transfer";

        tbody.innerHTML += `
            <tr>
                <td>
                    ${idx + 1}
                </td>

                <td>${formatDate(trans.created_at)}</td>

                <td>
                    <span class="${paymentClass}">
                        ${trans.payment_method}
                    </span>
                </td>

                <td>
                    ${formatRupiah(trans.subtotal)}
                </td>

                <td>

                    <button class="btn-view" onclick="openReceipt(${trans.id})">
                        Lihat
                    </button>

                    <button class="btn-print" onclick="printReceipt(${trans.id})">
                        Print
                    </button>

                </td>

            </tr>
        `;

    });

}

// load summary overview
async function loadSummary() {
    const summary = await window.api.getTransactionSummary();

    const values = document.querySelectorAll(".summary-value");

    values[0].textContent = summary.totalTransactions['total'];
    values[1].textContent =
        "Rp " + summary.totalCash['total'].toLocaleString("id-ID");
    values[2].textContent =
        "Rp " + summary.totalTransfer['total'].toLocaleString("id-ID");
}

// open receipt modal
async function openReceipt(id){

    await renderReceipt(id);

    document.getElementById("printReceiptBtn").addEventListener("click", () => {
        printReceipt(id)
    });

    Modal.show(modalReceipt);
}

// print receipt
async function printReceipt(id){

    Toast.info('Menyiapkan printer...');
    
    await window.api.printReceipt(id);
}

//detect if printing success
window.api.onPrintSuccess((result) => {
   
    if(result.success)
        Toast.success('Resi berhasil diprint!');
    else
        Toast.error(`Resi gagal diprint: ${result.errorType}`);
});