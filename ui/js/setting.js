const modalUsername = "usernameModal";
const modalVerify = "verifyModal";
const modalPassword = "passwordModal";

let usernameModal = null;
let verifyModal = null;
let passwordModal = null;

let userId = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.api.getCurrentUser();

    if(!user)
        return;

    Navbar.init();

    document.getElementById("username").value = user.username;
    
    userId = user.id;

    document.getElementById("userRole").textContent = user.role;

    // create update username modal
    usernameModal = Modal.init({
            id: modalUsername,
            title: "Ganti Username",
            subtitle: "Masukkan username baru Anda.",
            body: `<div class="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        id="newUsername"
                        maxlength="100"
                    >
                </div>`,
            footer: `
                <button class="btn-primary" id="btnChangeUsername">
                    Ganti
                </button>

                <button
                    class="btn-secondary"
                    id="btnCancelUsername">
                    Batal
                </button>
            `
        });

    // create verify password modal
    verifyModal = Modal.init({
            id: modalVerify,
            title: "Verifikasi Akun Anda",
            subtitle: "Untuk ubah password, masukkan password lama Anda.",
            body: `
                <div id="old-password-area" class="form-group">
                    <label>Password Lama</label>
                    <!-- inject password input -->
                </div>
                `,
            footer: `
                <button class="btn-primary" id="btnVerifyPassword">
                    Lanjut
                </button>

                <button
                    class="btn-secondary"
                    id="btnCancelVerify">
                    Batal
                </button>
            `
        });

    // create reset password modal
    passwordModal = Modal.init({
            id: modalPassword,
            title: "Ubah Password Anda",
            subtitle: "Masukkan password baru Anda.",
            body: `
                <div id="new-password-area" class="form-group">
                    <label>Password Baru</label>
                    <!-- inject password input -->
                </div>

                <small class="helper-text">
                    Password harus terdiri minimal:
                    <ul>
                        <li>8 karakter</li>
                        <li>1 huruf kapital</li>
                        <li>1 simbol (!@#$%)</li>
                    </ul>
                </small>

                <div id="confirm-password-area" class="form-group">
                    <label>Konfirmasi Password Baru</label>
                    <!-- inject password input -->
                </div>
                `,
            footer: `
                <button class="btn-primary" id="btnResetPassword">
                    Reset Password
                </button>

                <button
                    class="btn-secondary"
                    id="btnCancelResetPassword">
                    Batal
                </button>
            `
        });

    // on modal update username
    if(usernameModal){
        
        document.getElementById('btnChangeUsername').addEventListener('click', async () => {
            const newUsername = document.getElementById('newUsername').value;

            if(!newUsername){
                Toast.error('Username wajib diisi!');

                return;
            }

            const userData = {
                id: userId,
                username: newUsername
            }

            const result = await window.api.updateUsername(userData);

            if(result.success){
                Toast.success(result.msg);

                document.getElementById("username").value = result.user.username;
                document.getElementById("profileUsername").textContent = result.user.username;
                document.getElementById("headerUsername").textContent = result.user.username;

                Modal.close(modalUsername);
            }
        
        });

        document.getElementById('btnCancelUsername').addEventListener('click', () => {
            Modal.close(modalUsername);
        });
    }

    // on modal verify password
    if(verifyModal){
        const oldPasswordInput = PasswordInput.create(
            "oldPassword",
            ""
        );

        document.getElementById("old-password-area").appendChild(oldPasswordInput);

        document.getElementById('btnVerifyPassword').addEventListener('click', async () => {
            const password = document.getElementById('oldPassword').value;

            if(!password){
                Toast.error('Password Lama wajib diisi!');

                return;
            }

            const userData = {
                id: userId,
                password: password
            }

            const result = await window.api.verifyPassword(userData);

            if(result.success){
                Toast.success(result.msg);

                Modal.close(modalVerify);

                Modal.show(modalPassword);
            }
            else{
                Toast.error(result.msg);
            }
        
        });

        document.getElementById('btnCancelVerify').addEventListener('click', () => {
            Modal.close(modalVerify);
        });
    }

    // on modal reset password
    if(passwordModal){
        const newPasswordInput = PasswordInput.create(
            "newPassword",
            ""
        );

        const confirmPasswordInput = PasswordInput.create(
            "confirmNewPassword",
            ""
        );

        document.getElementById("new-password-area").appendChild(newPasswordInput);
        document.getElementById("confirm-password-area").appendChild(confirmPasswordInput);

        document.getElementById('btnResetPassword').addEventListener('click', async () => {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;

            const resultPassword = Validation.password(newPassword);

            if(!resultPassword.valid){
                Toast.error(resultPassword.message);
        
                return;
            }

            if (newPassword !== confirmPassword) {
                Toast.error("Password tidak sama!");

                return;
            }

            const userData = {
                id: userId,
                password: newPassword
            }

            const result = await window.api.resetPassword(userData);

            if(result.success){
                Toast.success(result.msg);

                Modal.close(modalPassword);
            }
            else{
                Toast.error(result.msg);
            }
        
        });

        document.getElementById('btnCancelResetPassword').addEventListener('click', () => {
            Modal.close(modalPassword);
        });
    }

});

document.getElementById('btnEditUsername').addEventListener('click', () => {
    Modal.show(modalUsername);
});

document.getElementById('btnUbahPassword').addEventListener('click', () => {
    Modal.show(modalVerify);
});
