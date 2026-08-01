class TableToolbar {

    static init({
        id = "table-controls",
        isFilter = false,
        isExport = false,
        onSearch = () => {},
        onDateChange = () => {},
        onPaymentChange = () => {},
        onExportExcel = () => {}
    } = {}) {

        const container = document.getElementById(id);

        if (!container) return;

        container.innerHTML = `

            <div class="table-toolbar">

                <div class="table-toolbar-left">

                    <input
                        type="search"
                        class="table-search"
                        placeholder="Search..."
                    >

                    ${isFilter ? `
                        <select class="date-filter">

                            <option value="">
                                All Time
                            </option>

                            <option value="today">
                                Today
                            </option>

                            <option value="yesterday">
                                Yesterday
                            </option>

                            <option value="week">
                                Last 7 Days
                            </option>

                            <option value="month">
                                Last 30 Days
                            </option>

                        </select>

                        <select class="payment-filter">

                            <option value="">
                                All Payment
                            </option>

                            <option value="cash">
                                Cash
                            </option>

                            <option value="transfer">
                                Transfer
                            </option>

                        </select>` : ''
                    }

                </div>

                ${isExport ? `
                    <button id="excelBtn" class="export-btn">
                        Export Excel
                    </button>` : ''
                }
            </div>
        `;

        const search = container.querySelector(".table-search");

        search.addEventListener("input", e => {
            onSearch(e.target.value);
        });

        if(isFilter){
            const date = container.querySelector(".date-filter");

            const payment = container.querySelector(".payment-filter");

            date.addEventListener("change", e => {
                onDateChange(e.target.value);
            });

            payment.addEventListener("change", e => {
                onPaymentChange(e.target.value);
            });
        }

        if(isExport){
            const btn = document.getElementById("excelBtn");

            btn.addEventListener("click", e => {
                onExportExcel();
            });

        }
    }
}