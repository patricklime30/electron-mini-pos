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

    saveTransaction: (data) => {
        return ipcRenderer.invoke("create-transaction", data);
    },

    getAllTransaction: () => {
        return ipcRenderer.invoke("get-all-transaction");
    },

    getTransactionSummary: () => {
        return ipcRenderer.invoke("get-transaction-summary");
    },

    getReceipt: (id) => {
        return ipcRenderer.invoke("get-receipt", id);
    },

    printReceipt: (id) => {
        return ipcRenderer.invoke("print-receipt", id);
    },

    onReceiptPrint: (callback) => {
        
        ipcRenderer.on("receipt-print", (event, id) => {
                callback(id);
            });
    },

    receiptReady: () => {
        
        return ipcRenderer.invoke("receipt-ready");
    },

    onPrintSuccess: (callback) => {
        ipcRenderer.on("print-success", (event, result) => callback(result));
    },

    getStoreInfo: () => {
        return ipcRenderer.invoke("get-store-info");
    },

    updateUsername: (data) => {
        return ipcRenderer.invoke("update-username", data);
    },

    verifyPassword: (data) => {
        return ipcRenderer.invoke("verify-password", data);
    },

    resetPassword: (data) => {
        return ipcRenderer.invoke("reset-password", data);
    },

    logout: () => {
        return ipcRenderer.invoke("logout");
    },
});