import { IpcLogger } from "@src/utils/IpcLogger";
import { app, BrowserWindow, ipcMain } from "electron";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
// import { connectIM, setupWebIm } from "./im";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

require("update-electron-app")();

const mainWindowHandle: BrowserWindow = undefined;

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (process.env.NODE_ENV === "development") {
        // Open the DevTools.
        mainWindow.webContents.openDevTools({ mode: "undocked" });
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
    // installExtension(VUEJS_DEVTOOLS);
});

if (process.env.NODE_ENV === "development") {
    app.whenReady().then(() => {
        installExtension(VUEJS_DEVTOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log("An error occurred: ", err));
    });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

(global as any).remoteRequests = require("./requests");
// (global as any).remoteIm = require("./im");

const logger = new IpcLogger(mainWindowHandle);

// import jsdom from "jsdom";
// const { JSDOM } = jsdom;
// const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
//     url: "https://im.chaoxing.com/webim/me",
// });

// //将window对象设置为nodejs中全局对象;
// (global as any).window = window;
// (global as any).navigator = window.navigator;
// (global as any).location = window.location;
// (global as any).document = window.document;
// (global as any).WebSocket = window.WebSocket;
// import "../../static/Easemob-chat-3.6.3";

// console.log(window);
// console.log(global.window);

// initialImEnvironment(logger);
// setupWebIm(logger);
// console.log("easemob initial complete");

ipcMain.on("connect", (event, uid: number, cookie: string, imToken: string) => {
    try {
        // console.log(window.webIM);
        // connectIM(uid, cookie, imToken);
    } catch (e) {
        console.error(e);
        logger.error(e);
    }
});
