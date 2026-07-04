document.addEventListener("DOMContentLoaded", async () => {
    const user = await ipcRenderer.invoke("get:currentUser");

    if(!user)
        return;

    Navbar.init();

});