import { remote } from "electron";

import * as moduleRequests from "@main/requests";
import pushModule from "@store/push";
import logger, { LOG_LEVELS } from "./logger";

const remoteRequests: typeof moduleRequests = remote.getGlobal("remoteRequests");

export async function pushService(source: "sign" | "log", message: string, level?: LoggerLevel) {
    let pushFlag = false;

    if (source === "sign") {
        if (pushModule.pushLevel.onlySign) {
            pushFlag = true;
        }
    } else {
        if (LOG_LEVELS[level] >= LOG_LEVELS[pushModule.pushLevel.logLevel]) {
            pushFlag = true;
        }
    }

    if (!pushFlag) return;

    // logger.info("符合推送发送条件，开始推送");

    if (pushModule.onebotConf.enable) {
        for (const target of pushModule.onebotTargets) {
            await remoteRequests.pushToOnebot({
                address: pushModule.onebotConf.address,
                targetType: target.type,
                identifier: `${target.identifier}`,
                message,
            });
        }
    }

    if (pushModule.serverChan.enable) {
        // await remoteRequests.pushToServerChan({})
    }
}
