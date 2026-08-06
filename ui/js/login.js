const modalVerify = "verifyModal";
const modalReset = "resetModal";

let verifyModal = null;
let resetModal = null;
let userId = null;

document.addEventListener("DOMContentLoaded", () => {

    const passwordInput = PasswordInput.create(
        "login-password",
        "Masukkan password"
    );

    document
        .getElementById("password-area")
        .appendChild(passwordInput);

    // create verify password modal
    verifyModal = Modal.init({
        id: modalVerify,
        title: "Pemulihan Akun",
        subtitle: "Untuk reset username password Anda. Masukkan kunci pemulihan yang telah diberikan",
        body: `
            <div class="form-group">
                <label>Kunci Pemulihan</label>
                <input
                    type="text"
                    id="recoveryKey"
                    maxlength="100"
                >
            </div>

            <small class="helper-text">
                Contoh: RK7F-MQ2P-X9DL-84NT
            </small>
            `,
        footer: `
            <button class="btn-primary" id="btnVerifyRecoveryKey">
                Lanjut
            </button>

            <button
                class="btn-secondary"
                id="btnCancelVerify">
                Batal
            </button>
        `
    });

    // create update username modal
    resetModal = Modal.init({
        id: modalReset,
        title: "Ganti Username & Password",
        subtitle: "Masukkan username dan password baru Anda.",
        body: `<div class="form-group">
                <label>Username</label>
                <input
                    type="text"
                    id="newUsername"
                    maxlength="100"
                >
            </div>

            <div id="new-password-area" class="form-group">
                <label>Password Baru</label>
                <!-- inject password input -->
            </div>

            <small class="helper-text">
                Password harus terdiri minimal:
                <ul>
                    <li>8 karakter</li>
                    <li>1 huruf kapital</li>
                    <li>1 angka</li>
                    <li>1 simbol (!@#$%)</li>
                </ul>
            </small>

            <div id="confirm-password-area" class="form-group">
                <label>Konfirmasi Password Baru</label>
                <!-- inject password input -->
            </div>`,
        footer: `
            <button class="btn-primary" id="btnResetAccount">
                Ganti
            </button>

            <button
                class="btn-secondary"
                id="btnCancelResetAccount">
                Batal
            </button>
        `
    });

    // on modal verify password
    if(verifyModal){

        document.getElementById('btnVerifyRecoveryKey').addEventListener('click', async () => {
            const key = document.getElementById('recoveryKey').value;

            if(!key){
                Toast.error('Kunci wajib diisi!');

                return;
            }

            try{
                const result = await window.api.verifyRecovery(key);

                if(result.success){
                    Toast.success(result.msg);
                    userId = result.userId; 

                    Modal.close(modalVerify);

                    Modal.show(modalReset);                    
                }
                else{
                    Toast.error(result.msg);
                }
            }
            catch(err){
                Toast.error(err.message);
            }
        
        });

        document.getElementById('btnCancelVerify').addEventListener('click', () => {
            Modal.close(modalVerify);
        });
    }

    // on modal reset
    if(resetModal){
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

        document.getElementById('btnResetAccount').addEventListener('click', async () => {
            const newUsername = document.getElementById('newUsername').value;

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

            if(!newUsername){
                Toast.error('Username wajib diisi!');

                return;
            }

           // Update username
            try {

                const result = await window.api.updateUsername({
                    id: userId,
                    username: newUsername
                });

                if (!result.success) {
                    Toast.error(result.msg);
                    return;
                }

            } catch (err) {

                Toast.error("Gagal update username");
                console.error(err);
                return;

            }

            // Update password
            try {

                const result = await window.api.resetPassword({
                    id: userId,
                    password: newPassword
                });

                if(result.success){
                    Toast.success(`Akun telah diganti. 
                        Silahkan login kembali dengan username dan password terbaru`);

                    Modal.close(modalReset);
                }
                else{
                    Toast.error(result.msg);
                }

            } catch (err) {

                Toast.error("Gagal update password");
                console.error(err);
                return;

            }
        
        });

        document.getElementById('btnCancelResetAccount').addEventListener('click', () => {
            Modal.close(modalReset);
        });
    }

});

document.getElementById("btnLogin").addEventListener("click", async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username) {
        Toast.error("Username wajib diisi");

        return;
    }

    if (!password) {
        Toast.error("Password wajib diisi");

        return;
    }

    const result = await window.api.checkLogin({username, password});
    
    if(result.success)
        window.location.href = "dashboard.html";
    else
        Toast.error(result.message);

    return;
});

document.getElementById('recoverAccountBtn').addEventListener('click', () => {
    Modal.show(modalVerify);
});
