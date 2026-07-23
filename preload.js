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

    logout: () => {
        return ipcRenderer.invoke("logout");
    },

});