type FunctionOrPromise = (task: ITask, activity: Activity) => any | Promise<any>;

export class Watcher {
    _handlers: { [key in SignTypes]: FunctionOrPromise[] };

    constructor() {
        this._handlers = {} as any;
    }

    emit(event: SignTypes, task: ITask, activity: Activity) {
        for (const handler of this._handlers[event]) {
            if (handler && typeof (handler as any).then == "function") {
                handler(task, activity).then();
            } else {
                handler(task, activity);
            }
        }
    }

    on(event: SignTypes, handler: FunctionOrPromise) {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }

        if (!this._handlers[event].includes(handler)) {
            this._handlers[event].push(handler);
        }
    }

    off(event: SignTypes, handler: () => FunctionOrPromise) {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }

        const index = this._handlers[event].indexOf(handler);
        if (index !== -1) {
            this._handlers[event].splice(index, 1);
        }
    }

    once(event: SignTypes, handler: () => FunctionOrPromise) {}
}

export default new Watcher();

// (async () => {
//     const watcher = new Watcher();

//     watcher.on("normal", () => {
//         console.error("in normal callback");
//     });

//     const a = async () => {
//         console.error("in normal async  callback");
//         // await sleep(1000);
//         console.error("in normal  async callback");
//     };
//     watcher.on("normal", a);
//     console.error(watcher);

//     await sleep(1000);

//     watcher.emit("normal");
//     watcher.off("normal", a);
//     console.error(watcher);
//     watcher.emit("normal");
// })();
