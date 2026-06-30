// Create the toast element when the page loads
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="toast" class="toast">
                 <div class="toast-content">
                    <span id="toast-icon" class="toast-icon"></span>
                    <span id="toast-message"></span>
                </div>

                <div class="toast-progress"></div>
            </div>
        `);
    }
});

class Toast {
    static timeout;

    static icons = {
        success: "✔",
        error: "✖",
        info: "ℹ",
        warning: "⚠"
    };

    static show(message, type = "info") {
        const toast = document.getElementById("toast");
        const text = document.getElementById("toast-message");
        const icon = document.getElementById("toast-icon");
        const toastProgress = document.querySelector(".toast-progress");

        text.textContent = message;
        icon.textContent = this.icons[type] || "";
        icon.className = `toast-icon ${type}`;

        toast.className = `toast ${type} show`;

        clearTimeout(this.timeout);

        // Restart progress animation
        toastProgress.style.animation = "none";
        void toastProgress.offsetWidth;
        toastProgress.style.animation = `shrink 3000ms linear forwards`;

        this.timeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    static success(message) {
        this.show(message, "success");
    }

    static error(message) {
        this.show(message, "error");
    }

    static info(message) {
        this.show(message, "info");
    }
}