function toggleMenu() {
    document.getElementById("dropdownMenu").classList.toggle("show");
}

document.addEventListener("click", (e) => {
    const menu = document.querySelector(".user-menu");
    if (!menu.contains(e.target)) {
        document.getElementById("dropdownMenu").classList.remove("show");
    }
});

function logout() {
    window.location.href = "login.html";
}