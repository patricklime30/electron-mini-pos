const modalReceipt = "receiptModal";

let receiptModal = null;

const state = {
    search: "",
    payment: "",
    date: "",
    page: 1,
    limit: 10
};

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

    // Initialize toolbar
    TableToolbar.init({
        id: "order-toolbar",
        isFilter: true,
        onSearch(value) {
            state.search = value;
            state.page = 1;
            loadTransactions();
        },
        onDateChange(value) {
            state.date = value;
            state.page = 1;
            loadTransactions();
        },
        onPaymentChange(value) {
            state.payment = value;
            state.page = 1;
            loadTransactions();
        }

    });

    // initialize pagination
    TablePagination.init({
        id: "order-pagination",
        currentPage: 1,
        totalPages: 1,
        onChange(page) {
            state.page = page;
            loadTransactions();
        }

    });
});

// load transaction table
async function loadTransactions(){

    const transactions = await window.api.getAllTransaction();

    let filtered = transactions;

    // SEARCH
    if(state.search){

        const keyword = state.search.toLowerCase();

        filtered = filtered.filter(trans => {
            return (
                trans.payment_method.toLowerCase().includes(keyword) ||
                formatDate(trans.created_at)
                    .toLowerCase()
                    .includes(keyword)
            );
        });

    }

    // filter by payment method
    if(state.payment){

        filtered = filtered.filter(trans => {
            return trans.payment_method === state.payment;
        });

    }

    // filter by date
    filtered = filterByDate(filtered, state.date);

    const totalPages = Math.ceil(filtered.length / state.limit);

    // avoid page going beyond total pages
    if(state.page > totalPages){
        state.page = 1;
    }

    // PAGINATION
    const start = (state.page - 1) * state.limit;

    const result = filtered.slice(start, start + state.limit);

    const tbody = document.getElementById("transactionTable");

    tbody.innerHTML = "";

    // No data
    if (result.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    Transaksi tidak ditemukan
                </td>
            </tr>
        `;

        return;
    }

    result.forEach((trans, idx )=>{

        const paymentClass =
            trans.payment_method === "cash"
                ? "payment-cash"
                : "payment-transfer";

        const number = (state.page - 1) * state.limit + idx + 1;

        tbody.innerHTML += `
            <tr>
                <td>
                    ${number}
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

    TablePagination.update({
        id: "order-pagination",
        currentPage: state.page,
        totalPages: totalPages
    });
}

// filter date
function filterByDate(transactions, range) {

    if (!range) {
        return transactions; // All Time
    }

    const now = new Date();

    return transactions.filter(trans => {
        const date = new Date(trans.created_at);

        if (range === "today") {

            return (
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );

        }

        if (range === "yesterday") {

            const yesterday = new Date();

            yesterday.setDate(
                now.getDate() - 1
            );

            return (
                date.getDate() === yesterday.getDate() &&
                date.getMonth() === yesterday.getMonth() &&
                date.getFullYear() === yesterday.getFullYear()
            );

        }

        if (range === "week") {

            const sevenDaysAgo = new Date();

            sevenDaysAgo.setDate(
                now.getDate() - 7
            );

            return date >= sevenDaysAgo;

        }

        if (range === "month") {

            const thirtyDaysAgo = new Date();

            thirtyDaysAgo.setDate(
                now.getDate() - 30
            );

            return date >= thirtyDaysAgo;
        }

        return true;

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