const modal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("productPrice");
const stockInput = document.getElementById("productStock");
const imageInput = document.getElementById("productImage");

const deleteModal = document.getElementById("deleteModal");

let editingId = null;
let deleteId = null;

let selectedImage = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.api.getCurrentUser();

    if(!user)
        return;

    Navbar.init();

    loadProducts();
});

// add delimiter price input while typing
priceInput.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "");

    if (value === "") {
        this.value = "";
        return;
    }

    this.value = new Intl.NumberFormat("id-ID").format(value);

});

// Get the image path in renderer
imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (file) {
        selectedImage = window.api.getFilePath(file);

        console.log(selectedImage);
    }

});

// click add button
document.getElementById("btnAdd").addEventListener("click", () => {
    
    addProduct();
});

// open modal
function openModal(modalId){
    modalId.classList.add('show');
}

// set add product modal
function addProduct(){
    editingId = null;

    modalTitle.textContent = "Tambah Produk";

    nameInput.value = "";
    priceInput.value = "";
    stockInput.value = "";
    imageInput.value = "";

    openModal(modal);
}

// click save button
document.getElementById("saveBtn").addEventListener("click", async () => {
    if(!nameInput.value){
        Toast.error('Nama produk wajib diisi');

        return;
    }

    if(!priceInput.value || isNaN(priceInput.value) || priceInput.value < 0){
        Toast.error('Format harga tidak sesuai');
        return;
    }

    if(!stockInput.value || isNaN(stockInput.value) || stockInput.value < 0){
        Toast.error('Format stok tidak sesuai');
        return;
    }

    // remove thousand formatter
    const price = Number(priceInput.value.replace(/\./g, ""));

    const product = {
        id: editingId,
        name: nameInput.value,
        price: price,
        stock: Number(stockInput.value),
        image: selectedImage
    };

    const result = await window.api.addUpdateProduct(product);

    Toast.success(result.action);
    
    closeModal(modal);

    // show product to table
    loadProducts();
});

// render product data to table
async function loadProducts(){

    const products = await window.api.getAllProduct();

    const tbody = document.getElementById("productTable");

    tbody.innerHTML = "";

    products.forEach(product=>{

        tbody.innerHTML += `
            <tr>
                <td>
                    <img 
                        src="${product.image 
                            ? `../../${product.image}` 
                            : "../../images/image-not-found.png"}" 
                        alt="${product.name}"
                        class="product-img"
                    >
                </td>

                <td>${product.name}</td>

                <td>
                    ${new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0
                    }).format(product.price)}
                </td>

                <td>${product.stock}</td>

                <td>

                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        Ubah
                    </button>

                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        Hapus
                    </button>

                </td>

            </tr>
        `;

    });

}

// click cancel Product modal
document.getElementById("cancelProductBtn").addEventListener("click", () => {

    closeModal(modal);
});

// click x Product modal
document.getElementById("closeProductModal").addEventListener("click", () => {

    closeModal(modal);
});

// close product modal
function closeModal(modalId){
    
    modalId.classList.remove("show");
}

// click edit product modal
async function editProduct(id){

    const product = await window.api.getSelectedProduct(id);

    // render product data to edit modal
    editingId = product.id;

    modalTitle.textContent = "Ubah Produk";

    nameInput.value = product.name;
    priceInput.value = new Intl.NumberFormat("id-ID").format(product.price);
    stockInput.value = product.stock;
    imageInput.value = "";

    openModal(modal);
}

// open delete modal
function deleteProduct(id) {

    deleteId = id;

    openModal(deleteModal);
}

// click delete button
document.getElementById("confirmDeleteBtn").onclick = async () => {

    if (!deleteId) return;

    try {
        const result = await window.api.deleteSelectedProduct(deleteId);

        Toast.success(result.message);

        closeModal(deleteModal);

        loadProducts();

    } catch (err) {
        Toast.error("Gagal menghapus produk");

        console.error(err);
    }
};

// click cancel Delete modal
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {

    closeModal(deleteModal);
});

// click x Delete modal
document.getElementById("closeDeleteModal").addEventListener("click", () => {

    closeModal(deleteModal);
});