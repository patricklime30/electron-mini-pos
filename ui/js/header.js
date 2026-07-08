class Navbar {
    static async init() {
        const user = await window.api.getCurrentUser();

        if (document.getElementById("navbar")) return;

        document.body.insertAdjacentHTML("afterbegin", `
            <header id="navbar" class="navbar">
                <div class="logo">MiniPOS</div>

                <nav class="nav-links">
                    <div class="nav-item active" data-page="dashboard">Dashboard</div>
                    <div class="nav-item" data-page="product">Produk</div>
                    <div class="nav-item" data-page="history">Riwayat</div>
                </nav>

                <div class="user-menu">
                    <div class="user-btn">
                        <img src="../../images/user.png" class="avatar">
                        <span>${user.username}</span>
                    </div>

                    <div class="dropdown">
                        <div class="user-info">
                            <img src="../../images/user.png" class="avatar-lg">

                            <div>
                                <div class="name">${user.username}</div>
                                <div class="role">${user.role}</div>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="menu-item">Pengaturan</div>
                        <div class="menu-item logout">Keluar</div>
                    </div>
                </div>
            </header>
        `);

        const currentPage = window.location.pathname;

        const navItems = document.querySelectorAll(".nav-item");

        // active nav button
        navItems.forEach(item => {
            item.classList.remove("active");

            if (currentPage.includes(item.dataset.page)) {
                item.classList.add("active");
            }
        });

        this.registerEvents();
    }

    static registerEvents() {
        const btn = document.querySelector(".user-btn");
        const dropdown = document.querySelector(".dropdown");
        const menu = document.querySelector(".user-menu");
        const logoutBtn = document.querySelector(".logout");
        const navItems = document.querySelectorAll(".nav-item");

        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            dropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });

        logoutBtn.addEventListener("click", () => {
            this.logout();
        });

         // click navigation
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                const page = item.dataset.page;

                window.location.href = `${page}.html`;
            });
        });
    }

    static async logout() {
        const result = await window.api.logout();

        if(result){
            Toast.info("Sedang logout...");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 800)
        }
            
    }
}