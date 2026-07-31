class TablePagination {

    static page = 1;
    static totalPages = 1;
    static onChange = () => {};

    static init({
        id = "table-pagination",
        currentPage = 1,
        totalPages = 1,
        onChange = () => {}
    }) {

        const pagination = document.getElementById(id);

        if (!pagination) return;

        this.page = currentPage;
        this.totalPages = totalPages;
        this.onChange = onChange;

        pagination.innerHTML = `

            <div class="table-pagination">

                <button class="prev">
                    Previous
                </button>

                <span class="page">
                    ${this.page} / ${this.totalPages}
                </span>

                <button class="next">
                    Next
                </button>

            </div>
        `;

        const prevBtn = pagination.querySelector(".prev");

        const nextBtn = pagination.querySelector(".next");

        prevBtn.addEventListener("click", () => {

            if (this.page > 1) {

                this.page--;

                this.refresh(id);

                this.onChange(this.page);
            }

        });

        nextBtn.addEventListener("click", () => {

            if (this.page < this.totalPages) {

                this.page++;

                this.refresh(id);

                this.onChange(this.page);

            }

        });

        this.refresh(id);
    }

    static update({
        id = "table-pagination",
        currentPage,
        totalPages
    }) {

        this.page = currentPage;

        this.totalPages = totalPages;

        this.refresh(id);
    }

    static refresh(id) {

        const pagination = document.getElementById(id);

        if (!pagination) return;

        const pageText = pagination.querySelector(".page");

        const prevBtn = pagination.querySelector(".prev");

        const nextBtn = pagination.querySelector(".next");

        pageText.textContent = `${this.page} / ${this.totalPages}`;

        prevBtn.disabled = this.page <= 1;

        nextBtn.disabled = this.page >= this.totalPages;

    }
}