type FunctionOrPromise = (task: ITask, activity: Activity) => any | Promise<any>;

export class Watcher {
    _handlers: { [key in SignType]: FunctionOrPromise[] };

    constructor() {
        this._handlers = {} as any;
    }

    emit(event: SignType, task: ITask, activity: Activity) {
        for (const handler of this._handlers[event]) {
            if (handler && typeof (handler as any).then == "function") {
                handler(task, activity).then();
            } else {
                handler(task, activity);
            }
        }
    }

    on(event: SignType, handler: FunctionOrPromise) {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }

        if (!this._handlers[event].includes(handler)) {
            this._handlers[event].push(handler);
        }
    }

    off(event: SignType, handler: () => FunctionOrPromise) {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }

        const index = this._handlers[event].indexOf(handler);
        if (index !== -1) {
            this._handlers[event].splice(index, 1);
        }
    }

    once(event: SignType, handler: () => FunctionOrPromise) {}
}

export default new Watcher();
