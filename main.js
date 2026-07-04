const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");

const { initDB } = require("./db/init");
const { createSchema } = require("./db/schema");

const setup = require("./db/crud/setting");
const store = require("./db/crud/store");
const admin = require("./db/crud/users");

let mainWindow;
let db;
let currentUser = null;

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