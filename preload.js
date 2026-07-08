const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("api", {
    setupComplete: (data) => {
        return ipcRenderer.invoke("setup:complete", data);
    },

    checkLogin: (data) => {
        return ipcRenderer.invoke("check:login", data);
    },

    getCurrentUser: () => {
        return ipcRenderer.invoke("get:currentUser");
    },

    addUpdateProduct: (data) => {
        return ipcRenderer.invoke("add-update-product", data);
    },

    getFilePath: (file) => {
        return webUtils.getPathForFile(file);
    },

    getAllProduct: () => {
        return ipcRenderer.invoke("get-all-products");
    },

    getSelectedProduct: (id) => {
        return ipcRenderer.invoke("get-specific-product", id);
    },

    deleteSelectedProduct: (id) => {
        return ipcRenderer.invoke("delete-specific-product", id);
    },

    logout: () => {
        return ipcRenderer.invoke("logout");
    },

});