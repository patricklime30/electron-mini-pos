class Modal {
    static init({
        id = "app-modal",
        title = "",
        subtitle = "",
        body = "",
        footer = "",
        closable = true
    } = {}) {
        let modal = document.getElementById(id);

        if (!modal) {
            document.body.insertAdjacentHTML("beforeend", `
                <div class="modal" id="${id}">
                    <div class="modal-content">
                        <div class="modal-header"></div>
                        <div class="modal-body"></div>
                        <div class="modal-footer"></div>
                    </div>
                </div>
            `);

            modal = document.getElementById(id);
        }

        const header = modal.querySelector(".modal-header");
        const bodyContainer = modal.querySelector(".modal-body");
        const footerContainer = modal.querySelector(".modal-footer");

        header.innerHTML = `
            <div>
                <h2 id="${id}-title">${title}</h2>
                ${subtitle ? `<p>${subtitle}</p>` : ""}
            </div>

            ${
                closable
                    ? `<button class="close-btn">&times;</button>`
                    : ""
            }
        `;

        bodyContainer.innerHTML = body;
        footerContainer.innerHTML = footer;

        const closeBtn = header.querySelector(".close-btn");
        
        if (closeBtn) {
            closeBtn.addEventListener("click", () => this.close(id));
        }

        return modal;
    }

    static show(id = "app-modal") {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.add("show");
        }
    }

    static close(id = "app-modal") {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.remove("show");
        }
    }
}