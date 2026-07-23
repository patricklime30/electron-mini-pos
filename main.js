const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");
const fs = require("fs");

const { initDB } = require("./db/init");
const { createSchema } = require("./db/schema");

const setup = require("./db/crud/setting");
const store = require("./db/crud/store");
const admin = require("./db/crud/users");
const product = require("./db/crud/product");
const transaction = require("./db/crud/transaction");

// const { renderReceipt } = require("./ui/js/receipt");

let mainWindow;
let db;
let currentUser = null;

const createWindow = (frontend_file) => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'images/logo.png')
    });

    mainWindow.loadFile(frontend_file);
    
    // activate inspect element
    mainWindow.webContents.openDevTools();

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });
}

// wizard saving process
ipcMain.handle("setup:complete", async (event, data) => {

    try {
        await store.create(data.store);
        await admin.create(data.admin);
        await setup.finishSetup();

        return { success: true };

    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
});

// login process
ipcMain.handle("check:login", async (event, data) => {
    const loggedStatus = await admin.getCredentials(data.username, data.password);

    if (loggedStatus.success) {
        currentUser = loggedStatus.user;
    }

    return loggedStatus;
});

// get current logged user data
ipcMain.handle("get:currentUser", () => {
    return currentUser;
});

//logout process
ipcMain.handle("logout", () => {
    currentUser = null;
    return true;
});

// get all products
ipcMain.handle("get-all-products", async () => {
    return await product.getAll(); 
});

// get specific product
ipcMain.handle("get-specific-product", async (event, id) => {
    return await product.getById(id); 
});

// add or update product
ipcMain.handle("add-update-product", async (event, data) => {
    const oldProduct = await product.getById(data.id);

    let image = oldProduct.image ?? null; // keep old image by default if exists

    // copy if new file image
    if (data.image) {
        const source = data.image;

        const uploadFolder = path.join(__dirname, "uploads");

        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder);
        }

        const fileName = Date.now() + "-" + path.basename(source);

        const dest = path.join(uploadFolder, fileName);

        // copy file to upload folder
        fs.copyFileSync(source, dest);

        // store the updated path
        data.image = "uploads/" + fileName;

        // remove old image from folder
        if (image) {

            const oldPath = path.join(__dirname, image);

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
    }
    else{
        data.image = image;
    }

    return await product.createOrUpdate(data);
    
});

// delete specific product
ipcMain.handle("delete-specific-product", async (event, id) => {
    return await product.remove(id); 
});

// store payment transaction
ipcMain.handle("create-transaction", async (event, data) => {
    return await transaction.createTransaction(data); 
});

// get all transactions
ipcMain.handle("get-all-transaction", async () => {
    return await transaction.getAll(); 
});

//get transaction summary
ipcMain.handle("get-transaction-summary", async () => {
    return await transaction.getSummary();
});

// get transaction receipt
ipcMain.handle("get-receipt", async (event, id) => {
    return await transaction.getReceipt(id); 
});

// print transaction receipt
ipcMain.handle("print-receipt", async (event, id) => {
    
    const printWindow = new BrowserWindow({
        width: 400,
        height: 700,
        show: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    printWindow.webContents.on("did-finish-load", () => {
      
        printWindow.webContents.send(
            "receipt-print",
            id
        );
    });

    await printWindow.loadFile("./ui/pages/receipt.html");
});

ipcMain.handle("receipt-ready", (event) =>{

    const win = BrowserWindow.fromWebContents(event.sender);

    win.webContents.print(
        {
            silent:false
        },
        (success, errorType) => {

            console.log("Print finished:", success);

            win.close()

        });
});


app.on('ready', async () => {
    // 1. create DB connection
    db = initDB(app);

    // 2. create tables
    await createSchema(db);

    // 3. load setup logic 
    const setup = require("./db/crud/setting");

    // 4. Check setup on app start using sqlite3
    const isDone = await setup.isSetupDone();

    const mainFile = isDone
            ? __dirname + "/ui/pages/login.html"
            : __dirname + "/ui/pages/setup.html";

    createWindow(mainFile);
    
});

app.on('window-all-closed', () => {
    if(process.platform !== "darwin")
        app.quit();
});