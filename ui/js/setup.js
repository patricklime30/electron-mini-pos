const { ipcRenderer } = require("electron");
// require("../../controller/setup")

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

// toggle password icon
function togglePassword(inputId, iconId) {
    const iconEyeShow = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>`;
    
    const iconEyeHide = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>`;

    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    icon.innerHTML = isHidden ? iconEyeHide : iconEyeShow;
}

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