import { BrowserWindow } from "electron";

export class IpcLogger {
    constructor(public mainWindow: BrowserWindow) {}

    __base(log: ILog) {
        this.mainWindow.webContents.send("log", log);
    }

    debug(message: string) {
        return this.__base({ level: "debug", message });
    }
    info(message: string) {
        return this.__base({ level: "info", message });
    }
    error(message: string) {
        return this.__base({ level: "error", message });
    }
    warning(message: string) {
        return this.__base({ level: "warning", message });
    }
    success(message: string) {
        return this.__base({ level: "success", message });
    }

    sign(activeId: string | number) {
        this.mainWindow.webContents.send("sign", activeId);
    }
}
