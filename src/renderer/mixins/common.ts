import Vue from "vue";
import Component from "vue-class-component";

import logger from "@src/utils/logger";

interface IWithLogNotify {
    title: string;
    message: string;
    level: LoggerLevel;
}

const defaultOptions: Partial<IWithLogNotify> = {
    title: "提示",
};

@Component
export class WithLogNotify extends Vue {
    withLogNotify({ level, ...rest }: Partial<IWithLogNotify>) {
        const finalOptions = {
            ...defaultOptions,
            ...rest,
            level: level ? (level === "debug" ? "info" : level) : "info",
        };

        this.$notify({
            type: finalOptions.level,
            title: finalOptions.title,
            message: finalOptions.message,
        });

        logger.log({
            level: finalOptions.level,
            message: finalOptions.message,
        });
    }

    handleSignResponse(status: string) {
        if (status === "success") {
            this.withLogNotify({
                level: "success",
                title: "成功",
                message: "签到成功",
            });
        } else {
            this.withLogNotify({
                level: "warning",
                title: "异常",
                message: status,
            });
        }
    }
}
