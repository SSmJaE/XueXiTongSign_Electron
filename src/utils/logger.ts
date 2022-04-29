import { pushService } from "./push";

export const LOG_LEVELS = { debug: 0, info: 1, success: 2, warning: 3, error: 4 };

export class Logger {
    logs: ILog[];
    maxSize: number;

    constructor(maxSize = 500) {
        // 可调用实例的缺点，所有实例property undefined，需要显式转换
        // super("...args", "return this.__self__.__call__(...args)");

        // const self = this.bind(this);
        // this.__self__ = self;
        // return self;

        this.logs = [];
        this.maxSize = maxSize;

        console.log({ logs: this.logs });
    }

    // __call__(option: ILog) {
    //     return this.__base(option);
    // }

    __base(option: ILog) {
        if (this.logs.length > this.maxSize - 1) {
            this.logs.shift();
        }

        this.logs.push({ ...option, time: new Date() });
        pushService("log", option.message, option.level);
    }

    log(option: ILog) {
        return this.__base(option);
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
}

export default new Logger();
