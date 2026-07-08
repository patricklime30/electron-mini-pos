document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.api.getCurrentUser();

    if(!user)
        return;

    Navbar.init();

    loadProducts();
});

async function loadProducts(){

    const products = await window.api.getAllProduct();

    const productList = document.getElementById("productData");

    productList.innerHTML = "";

    products.forEach(product=>{

        productList.innerHTML += `
            <div class="product-card">
                
                <img 
                    src="${product.image 
                        ? `../../${product.image}` 
                        : "../../images/image-not-found.png"}" 
                    alt="${product.name}"
                    class="img"
                >

                <div class="info">
                    <div class="name">${product.name}</div>
                    <div class="price">
                        ${new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0
                        }).format(product.price)}
                    </div>
                </div>

                <button class="btn-primary">Pilih</button>
            </div>
           
        `;

    });

}