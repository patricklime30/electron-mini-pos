async function renderReceipt(id){
    const receipt = await window.api.getReceipt(id);

    document.getElementById("storeName").innerText = receipt.store['name'];
    document.getElementById("storePhone").innerText = `Telp: ${receipt.store['phone']}`;
    document.getElementById("storeAddress").innerText = receipt.store['address'];

    const container = document.getElementById("orderItems");

    container.innerHTML = "";

    if(receipt.items.length > 0){
        receipt.items.forEach(item => {

            container.innerHTML += `
                <div class="receipt-item">

                    <div class="item-info">
                        <span class="item-name">
                            ${item.name}
                        </span>

                        <span class="item-qty">
                            ${item.quantity} x ${formatRupiah(item.price)}
                        </span>
                    </div>

                    <strong>
                        ${formatRupiah(item.total)}
                    </strong>

                </div>
            `;

        });
    }

    document.getElementById("orderDate").innerText = formatDate(receipt.transaction['created_at']);
    
    document.getElementById("orderPayment").innerText = receipt.transaction['payment_method'];

    document.getElementById("orderTotal").innerText = formatRupiah(receipt.transaction['subtotal']);
}

window.api.onReceiptPrint(async (id)=>{
   
    await renderReceipt(id);

    await window.api.receiptReady();
});