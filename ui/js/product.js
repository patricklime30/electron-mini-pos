const modal = "productModal";
const deleteModal = "deleteModal";

let editingId = null;
let deleteId = null;

let selectedImage = null;

let addEditProductModal = null;
let deleteProductModal = null;
let modalTitle;
let nameInput;
let priceInput;
let stockInput;
let imageInput;

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

    // create add&edit modal
    addEditProductModal = Modal.init({
            id: modal,
            title: "Tambah Produk",
            subtitle: "Masukkan informasi produk di bawah ini.",
            body: `
                <div class="form-group">
                    <label>Nama produk</label>
                    <input
                        type="text"
                        id="productName"
                        maxlength="100"
                    >
                </div>

                <div class="form-row">

                    <div class="form-group">
                        <label>Harga</label>
                        <input
                            type="text"
                            id="productPrice"
                        >
                    </div>

                    <div class="form-group">
                        <label>Stok</label>
                        <input
                            type="number"
                            id="productStock"
                            placeholder="0"
                        >
                    </div>

                </div>

                <div class="form-group">
                    <label>Gambar</label>
                    <input
                        type="file"
                        id="productImage"
                        accept="image/*"
                    >
                </div>
            `,
            footer: `
                <button
                    class="btn-primary"
                    id="saveBtn">
                    Simpan Produk
                </button>

                <button
                    class="btn-secondary"
                    id="cancelProductBtn">
                    Batal
                </button>
            `
        });

    // create delete modal
    deleteProductModal = Modal.init({
        id: deleteModal,
        title: "Hapus Produk",
        subtitle: "",
        body: `
            <p style="color:#374151">
                Apakah ingin menghapus produk <span id="productDeleteName"></span>?
            </p>
        `,
        footer: `
            <button class="btn-delete" id="confirmDeleteBtn">
                Ya, hapus
            </button>

            <button class="btn-secondary" id="cancelDeleteBtn">
                Batal
            </button>
        `
    });

    // GET ELEMENT AFTER MODAL EXISTS
    modalTitle = document.getElementById(`${modal}-title`);
    nameInput = document.getElementById("productName");
    priceInput = document.getElementById("productPrice");
    stockInput = document.getElementById("productStock");
    imageInput = document.getElementById("productImage");
    
    // modal exists
    if(addEditProductModal){
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

            if (file)
                selectedImage = window.api.getFilePath(file);

        });
        
        // click cancel Product modal
        document.getElementById("cancelProductBtn").addEventListener("click", () => {

            closeModal(modal);
        });

        // click save button
        document.getElementById("saveBtn").addEventListener("click", async () => {
            const MAX_NAME_LENGTH = 100;

            if(!nameInput.value){
                Toast.error('Nama produk wajib diisi');

                return;
            }

            if (nameInput.value.length > MAX_NAME_LENGTH) {
                Toast.error("Nama produck lebih dari 100 karakter");
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
    }

    if(deleteProductModal){
        
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
    }


    loadProducts();

    // Initialize toolbar
    TableToolbar.init({
        id: "product-toolbar",
        onSearch(value) {
            state.search = value;
            state.page = 1;
            loadProducts();
        },

    });

    // initialize pagination
    TablePagination.init({
        id: "product-pagination",
        currentPage: 1,
        totalPages: 1,
        onChange(page) {
            state.page = page;
            loadProducts();
        }

    });
});

// click add button
document.getElementById("btnAdd").addEventListener("click", () => {
    
    addProduct();
});

// open modal
function openModal(modalId){
    
    Modal.show(modalId); 
}

// set add product modal
function addProduct(){

    editingId = null;
   
    modalTitle.innerHTML = "Tambah Produk";

    nameInput.value = "";
    priceInput.value = "";
    stockInput.value = "";
    imageInput.value = "";

    openModal(modal);
}

// render product data to table
async function loadProducts(){

    const products = await window.api.getAllProduct();

    let filtered = products;

    // SEARCH
    if(state.search){

        const keyword = state.search.toLowerCase();

        filtered = filtered.filter(trans => {
            return (
                trans.name.toLowerCase().includes(keyword) ||
                trans.stock.toString().includes(keyword)
            );
        });

    }

    const totalPages = Math.ceil(filtered.length / state.limit);

    // avoid page going beyond total pages
    if(state.page > totalPages){
        state.page = 1;
    }

    // PAGINATION
    const start = (state.page - 1) * state.limit;

    const result = filtered.slice(start, start + state.limit);

    const tbody = document.getElementById("productTable");

    tbody.innerHTML = "";

    // No data
    if (result.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    Produk tidak ditemukan
                </td>
            </tr>
        `;

        return;
    }

    result.map( async(product)=>{

        const imagePath = await window.api.getImagePath(product.image);

        tbody.innerHTML += `
            <tr>
                <td>
                    <img 
                        src="${imagePath}" 
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

                <td style="text-align: center;">${
                    product.stock <= 0
                        ? '<span class="stock-badge out">Habis</span>'
                        : product.stock
                    }
                </td>

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

    TablePagination.update({
        id: "product-pagination",
        currentPage: state.page,
        totalPages: totalPages
    });

}

// close product modal
function closeModal(modalId){
    
    Modal.close(modalId);
}

// click edit product modal
async function editProduct(id){

    const product = await window.api.getSelectedProduct(id);

    // render product data to edit modal
    editingId = product.id;

    modalTitle.innerHTML = "Ubah Produk";

    nameInput.value = product.name;
    priceInput.value = new Intl.NumberFormat("id-ID").format(product.price);
    stockInput.value = product.stock;
    imageInput.value = "";

    openModal(modal);
}

// open delete modal
async function deleteProduct(id) {

    deleteId = id;

    const product = await window.api.getSelectedProduct(id);

    document.getElementById('productDeleteName').innerHTML = product.name;

    openModal(deleteModal);
}