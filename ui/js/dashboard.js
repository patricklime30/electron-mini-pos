const modalCheckout = "checkoutModal";
let cart = [];
let productArray = [];

let paymentMethod = null;
let checkoutModal = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.api.getCurrentUser();

    if(!user)
        return;

    Navbar.init();

    // create checkout modal
    checkoutModal = Modal.init({
            id: modalCheckout,
            title: "Pilih Pembayaran",
            subtitle: "",
            body: `
                <div class="payment-options">

                    <button class="payment-card cash"
                        onclick="selectPayment('cash')">

                        <span class="payment-icon">
                            💵
                        </span>

                        <span>
                            Cash
                        </span>

                    </button>


                    <button class="payment-card transfer"
                        onclick="selectPayment('transfer')">

                        <span class="payment-icon">
                            🏦
                        </span>

                        <span>
                            Transfer
                        </span>

                    </button>
                </div>
            `,
            footer: `

                <button
                    class="btn-secondary"
                    id="cancelCheckoutBtn">
                    Batal
                </button>
            `
        });

    if(checkoutModal){
        // click cancel Product modal
        document.getElementById("cancelCheckoutBtn").addEventListener("click", () => {

            closeModal(modalCheckout);
        });
    }

    loadProducts();
});

// function add delimiter for number
const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
});

// format number shorter to easily read
function formatShortPrice(price) {
    if (price >= 1000000000)
        return `Rp ${(price / 1000000000).toFixed(1).replace(".0", "")}M`;

    if (price >= 1000000)
        return `Rp ${(price / 1000000).toFixed(1).replace(".0", "")}jt`;

    if (price >= 1000)
        return `Rp ${(price / 1000).toFixed(1).replace(".0", "")}rb`;

    return `Rp${price}`;
}

// limit title when displaying
function truncate(text, max = 50) {
    return text.length > max ? text.slice(0, max) + "..." : text;
}

async function loadProducts(){

    const products = await window.api.getAllProduct();

    const productList = document.getElementById("productData");

    productArray = products;

    productList.innerHTML = "";

    products.forEach(product=>{
        const item = cart.find(c => c.id === product.id);
        const qty = item ? item.qty : 0;

        productList.innerHTML += `
            <div class="product-card">
                
                <img 
                    src="${product.image 
                        ? `../../${product.image}` 
                        : "../../images/image-not-found.png"}" 
                    alt="${product.name}"
                    class="product-img"
                >
            
                <div class="product-name">${truncate(product.name)}</div>
                
                <div class="product-price">
                    ${formatShortPrice(product.price)}
                </div>

                <div class="product-stock">Stok: ${product.stock}</div>

                <div class="product-footer">
                    <button class="btn-primary" onclick="addToCart(${product.id})">Tambah</button>
                </div>
            </div>
           
        `;

    });

}

// add product item to cart
function addToCart(productId) {
    const product = productArray.find(product => product.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            ...product,
            qty: 1
        });
    }

    renderCart();
}

function renderCart() {

    const cartItems = document.querySelector(".cart-items");

    cartItems.innerHTML = "";

    cart.forEach(item => {

        cartItems.innerHTML += `
            <div class="cart-item">

                <div>
                    <div class="item-name">${truncate(item.name, 30)}</div>
                    <div class="item-price">${rupiah.format(item.price)}</div>
                </div>

                <div class="qty">

                    <button class="qty-btn minus" onclick="decreaseQty(${item.id})">-</button>

                    <span class="qty-value">${item.qty}</span>

                    <button class="qty-btn plus" onclick="increaseQty(${item.id})">+</button>

                </div>

            </div>
        `;
    });

    updateTotal();
    loadProducts(); //refresh product table
}

function increaseQty(id) {

    const item = cart.find(i => i.id === id);

    item.qty++;

    renderCart();
}

function decreaseQty(id) {

    const item = cart.find(i => i.id === id);

    item.qty--;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    renderCart();
}

function updateTotal() {

    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.qty);
    }, 0);

    document.getElementById("totalAmount").textContent = rupiah.format(total);
}

function openCheckout(){
    if(cart.length < 0){
        Toast.error('Tidak ada produk di keranjang');
        return;
    }

    Modal.show(modalCheckout);
}

function closeModal(modalId){
    Modal.close(modalId);
}

function selectPayment(method){

    paymentMethod = method;

    closeModal(modalCheckout);

    showPreview();
}

function showPreview(){

    const container = document.getElementById("previewItems");

    container.innerHTML = "";

    cart.forEach(item => {

        container.innerHTML += `
            <div class="preview-item">

                <div class="item-info">
                    <span class="item-name">
                        ${truncate(item.name)}
                    </span>

                    <span class="item-qty">
                        ${item.qty} x ${rupiah.format(item.price)}
                    </span>
                </div>


                <strong>
                    ${rupiah.format(item.qty * item.price)}
                </strong>

            </div>
        `;

    });

    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.qty);
    }, 0);

    document.getElementById("previewTotal").innerText = rupiah.format(total);

    document.getElementById("previewModal").classList.add("show");
}