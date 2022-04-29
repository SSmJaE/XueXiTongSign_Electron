// import { sleep } from "./common";
// // import logger from "./logger";
// import jsdom from "jsdom";
// const { JSDOM } = jsdom;


// export function setupWebIm() {
//     const window = global.window as any;
//     // const { window: window } = new JSDOM("<!doctype html><html><body></body></html>", {
//     //     url: "https://im.chaoxing.com/webim/me",
//     // });

//     //将window对象设置为nodejs中全局对象;
//     // (global as any).window = window;
//     // (global as any).navigator = window.navigator;
//     // (global as any).location = window.location;
//     // (global as any).document = window.document;
//     // (global as any).WebSocket = window.WebSocket;

//     // import("../../static/Easemob-chat-3.6.3.js");
//     // const window = document.querySelector("iframe").contentWindow as any;

//     window.WebIM.config = {
//         xmppURL: "https://im-api-vip6-v2.easecdn.com/ws",
//         apiURL: "https://a1-vip6.easecdn.com",
//         appkey: "cx-dev#cxstudy",
//         Host: "easemob.com",
//         https: true,
//         isHttpDNS: false,
//         isMultiLoginSessions: true,
//         isAutoLogin: true,
//         isWindowSDK: false,
//         isSandBox: false,
//         isDebug: false,
//         autoReconnectNumMax: Number.POSITIVE_INFINITY,
//         autoReconnectInterval: 2,
//         isWebRTC: true,
//         heartBeatWait: 2000,
//         delivery: false,
//     };
//     window.WebIM.conn = new window.WebIM.connection({
//         appKey: window.WebIM.config.appkey,
//         isHttpDNS: window.WebIM.config.isHttpDNS,
//         isMultiLoginSessions: window.WebIM.config.isMultiLoginSessions,
//         host: window.WebIM.config.Host,
//         https: window.WebIM.config.https,
//         url: window.WebIM.config.xmppURL,
//         apiUrl: window.WebIM.config.apiURL,
//         isAutoLogin: false,
//         heartBeatWait: window.WebIM.config.heartBeatWait,
//         autoReconnectNumMax: window.WebIM.config.autoReconnectNumMax,
//         autoReconnectInterval: window.WebIM.config.autoReconnectInterval,
//         isStropheLog: window.WebIM.config.isStropheLog,
//         delivery: window.WebIM.config.delivery,
//         isDebug: window.WebIM.config.isDebug,
//     });

//     window.WebIM.conn.listen({
//         onOpened: function(message: any) {
//             // logger.success("IM 协议连接成功");
//             console.log(message)
//         },
//         onClosed: function(message: any) {
//             // logger.warning("IM 协议连接关闭");
//             console.log(message)
//         },
//         onOnline: function() {},
//         onOffline: function() {
//             // logger.warning("IM 下线");
//             console.log()
//         },
//         onTextMessage: function(message: any) {
//             // logger.info(`IM 协议收到文本消息 ${JSON.stringify(message)}`);
//             console.log(message)

//             try {
//                 handleImMessage(message);
//             } catch (e) {
//                 // logger.error(`处理 IM 消息时出现异常，可能不是活动消息 ${e}`);
//             }
//         },
//         onError: async function(message: { type: number }) {
//             // logger.warning("IM 协议错误");
//             console.log(message)

//             if (message.type === 40) {
//                 // logger.warning("IM 协议身份验证失败，重新获取 token");

//                 window.WebIM.conn.close();
//                 await sleep(2000);

//                 // const token = await getImToken(userInfoCache.cookie);
//                 // connectIM(userInfoCache.uid, userInfoCache.cookie, token);
//             }
//         },
//         onEmojiMessage: function(message: any) {},
//         onPictureMessage: function(message: any) {},
//         onCmdMessage: function(message: any) {},
//         onAudioMessage: function(message: any) {},
//         onLocationMessage: function(message: any) {},
//         onFileMessage: function(message: any) {},
//         onVideoMessage: function(message: any) {},
//         onPresence: function(message: any) {},
//         onRoster: function(message: any) {},
//         onInviteMessage: function(message: any) {},
//         onBlacklistUpdate: function(list: any) {},
//     });
// }

// async function handleImMessage(message: ImMessage) {
//     if (message.data === "test") {
//         // logger.success("测试成功，WebSocket 在线");
//         console.log("测试成功，WebSocket 在线")

//     }

//     //不是签到信息
//     if (!message.ext.attachment) {
//         return;
//     }
//     if (message.ext.attachment.attachmentType !== 15) {
//         return;
//     }

//     const {
//         aid,
//         atype: activityType,
//         atypeName: activityName,
//         courseInfo: { coursename: courseName, courseid: courseId },
//     } = message.ext.attachment.att_chat_course;

//     // if (config.ignoreCourses.includes(courseId)) return;
//     if (!aid) {
//         // logger.warning("处理 IM 消息时出现异常，找不到 aid");
//         console.log("处理 IM 消息时出现异常，找不到 aid")
//         return;
//     }

//     switch (activityType) {
//         // 可能是签到
//         case 0:
//             if (!isSignActivity(message)) {
//                 // if (activityName) {
//                 //     logger.info(`收到 ${courseName} 的 ${activityName} 类型活动\naid: ${aid}`);
//                 // } else {
//                 //     logger.info(`收到 ${courseName} 的未知类型活动，需要引起注意\naid: ${aid}`);
//                 // }
//                 return;
//             }

//             break;
//         // 如果是签到，直接进入 case 2 处理
//         case 2:
//             // logger.sign(aid);

//             break;
//         default:
//             // logger.info(`收到 ${courseName} 的 ${activityName} 类型活动\naid: ${aid}`);
//             // "处理 IM 消息时出现异常，找不到 aid"

//             break;
//     }
// }

// /** 用于判断一个 activityType == 0 的消息是不是变相的签到消息 */
// function isSignActivity(type0Activity: ImMessage) {
//     let { url, pcUrl, logo, title } = type0Activity.ext.attachment.att_chat_course;
//     url = url.toLowerCase();
//     pcUrl = pcUrl.toLowerCase();
//     logo = logo.toLowerCase();

//     if (url.includes("sign") || url.includes("checkin")) {
//         return true;
//     }
//     if (pcUrl.includes("sign") || pcUrl.includes("checkin")) {
//         return true;
//     }
//     if (logo.includes("qd3.png")) {
//         return true;
//     }
//     return title.includes("签到");
// }

// const userInfoCache = {
//     uid: 0,
//     cookie: "",
// };

// export async function connectIM(uid: number, cookie: string, imToken: string) {
//     userInfoCache.uid = uid;
//     userInfoCache.cookie = cookie;

//     const options = {
//         apiUrl: "https://a1-vip6.easecdn.com",
//         user: uid,
//         accessToken: imToken,
//         appKey: "cx-dev#cxstudy",
//     };

//     (window as any).WebIM.conn.open(options);
// }
