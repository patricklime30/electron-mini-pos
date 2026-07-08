document.addEventListener("DOMContentLoaded", () => {

    const passwordInput = PasswordInput.create(
        "login-password",
        "Masukkan password"
    );

    document
        .getElementById("password-area")
        .appendChild(passwordInput);

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