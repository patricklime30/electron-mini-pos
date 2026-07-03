const { ipcRenderer } = require("electron");

let currentStep = 1;
const totalSteps = 3;

const setupData = {
    store: null,
    admin: null
};

// update sidebar step status
function updateSidebar(step) {

    for(let i = 1; i <= 3; i++) {

        const nav = document.getElementById(`nav-${i}`);
        const icon = nav.querySelector(".icon");

        nav.classList.remove(
            "active",
            "completed"
        );

        if(i < step) {
            nav.classList.add("completed");

            icon.textContent = "✓";
        }
        else if(i === step) {
            nav.classList.add("active");
        }
    }
}

// update button ui
function updateButtons(step) {

    const backBtn = document.getElementById("btnBack");
    const nextBtn = document.getElementById("btnNext");

    // BACK button rule
    backBtn.disabled = step === 1;

    // Optional UX improvement
    backBtn.style.opacity = step === 1 ? "0.4" : "1";
    backBtn.style.cursor = step === 1 ? "not-allowed" : "pointer";

    // LAST STEP change button text
    if (step === 4) {
        nextBtn.textContent = "Masuk Dashboard";
    } else {
        nextBtn.textContent = "Lanjut";
    }
}

// show current step page
function showStep(step) {

    document.querySelectorAll(".step-page").forEach(page => {
            page.classList.remove("active");
        });

    document.getElementById(`step-${step}`).classList.add("active");

    updateSidebar(step);

    updateButtons(step);

    currentStep = step;
}

// create password input
document.addEventListener("DOMContentLoaded", () => {

    const passwordInput = PasswordInput.create(
        "password",
        ""
    );

    const confirmPasswordInput = PasswordInput.create(
        "confirmPassword",
        ""
    );

    document.getElementById("password-area").appendChild(passwordInput);
    document.getElementById("confirm-password-area").appendChild(confirmPasswordInput);

});

updateButtons(currentStep);

// click next button
document.getElementById("btnNext").addEventListener("click", async () => {

    if(currentStep === 1){
        const name = document.getElementById("storeName").value;
        const phone = document.getElementById("storePhone").value;
        const address = document.getElementById("storeAddress").value

        if (!name) {
            Toast.error("Nama toko wajib diisi");

            return;
        }

        const resultPhone = Validation.phone(phone);

        if (!resultPhone.valid) {
            Toast.error(resultPhone.message);

            return;
        }

        setupData.store = {
            name: name,
            phone: phone,
            address: address
        };
    }

    if(currentStep === 2){
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // validation
        const resultUsername = Validation.username(username);

        if (!resultUsername.valid) {
            Toast.error(resultUsername.message);

            return;
        }

        const resultPassword = Validation.password(password);

        if(!resultPassword.valid){
            Toast.error(resultPassword.message);
    
            return;
        }

        if (password !== confirmPassword) {
            Toast.error("Password tidak sama!");

            return;
        }
        
        setupData.admin = {
            username: username,
            password: password,
            role: "admin"
        };
    }

    if (currentStep === 3) {
        const result = await ipcRenderer.invoke("setup:complete", setupData);

        if(result.success)
            window.location.href = "dashboard.html";
        else
            Toast.error(result.error);

        return;
    }

    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    }

});

// click back button
document.getElementById("btnBack").addEventListener("click", () => {

    if (currentStep > 1) {
        showStep(currentStep - 1);
    }

});