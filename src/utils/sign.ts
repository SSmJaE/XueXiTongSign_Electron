import { remote } from "electron";
import * as moduleRequests from "@main/requests";

import logger from "./logger";
import userModule from "@store/user";

const remoteRequests: typeof moduleRequests = remote.getGlobal("remoteRequests");

/** 根据activity emit相应的事件 */
export function figureSignType(Activity: Activity): SignType {
    // todo 判断签到类型，通过什么判断呢？

    let taskType: SignType = undefined;

    switch (Activity.activeType) {
        case 1:
            taskType = "normal";
            break;

        case 1:
            taskType = "location";
            break;

        case 1:
            taskType = "gesture";
            break;

        case 1:
            taskType = "picture";
            break;
    }

    logger.info(`检测到task xxx 的 xxx 类型 签到`);

    return taskType;
}

export async function sign(activity: Activity) {
    const response = await remoteRequests.sign({
        cookie: userModule.user.cookie,
        uid: userModule.user.uid,
        activeId: activity.id,
    });

    // 无法判断签到有无过期，只能得知是否签到过
    return response;
}

export async function signNormal() {}
export async function signLocation() {}
export async function signGesture() {}
export async function signPicture() {}
export async function signQrcode() {}
