const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");

const { initDB } = require("./db/init");
const { createSchema } = require("./db/schema");

const setup = require("./db/crud/setting");
const store = require("./db/crud/store");
const admin = require("./db/crud/users");

let mainWindow;
let db;

const createWindow = (frontend_file) => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
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

app.on('ready', () => {
    // 1. create DB connection
    db = initDB(app);

    // 2. create tables
    createSchema(db);

    // 3. load setup logic 
    const setup = require("./db/crud/setting");

    // 4. Check setup on app start
    const mainFile = setup.isSetupDone() ? __dirname + "/ui/pages/login.html" : __dirname + "/ui/pages/setup.html";
    console.log(setup.isSetupDone());
    
    createWindow(mainFile);
});

app.on('window-all-closed', () => {
    if(process.platform !== "darwin")
        app.quit();
});