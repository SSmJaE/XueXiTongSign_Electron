import axios from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
// import jsdom from "jsdom";
import queryString from "query-string";
import tough from "tough-cookie";

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
// const { JSDOM } = jsdom;

function generateUserAgent(platform: "desktop" | "mobile") {}

if (process.env.NODE_ENV === "development") {
    // axios.defaults.proxy = { host: "127.0.0.1", port: 8866 };
}

const PC_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36";
const MOBILE_AGENT =
    "Dalvik/2.1.0 (Linux; U; Android 10; MI 8 MIUI/V12.0.3.0.QEACNXM) com.chaoxing.mobile/ChaoXingStudy_3_4.7.4_android_phone_593_53 (@Kalimdor)_df14728a529c4e608a7b8f1112ca2825";

axios.interceptors.response.use(
    function(response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response.data;
    },
    function(error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    },
);

export async function login(account: string, password: string) {
    const response: ILoginReturn = await axios.post(
        "https://passport2-api.chaoxing.com/v11/loginregister",
        queryString.stringify({
            uname: account,
            code: password,
        }),
        {
            jar: cookieJar,
            headers: {
                "User-Agent": PC_AGENT,
            },
        },
    );

    if (response.status) {
        console.log(cookieJar);

        const cookies = cookieJar.toJSON().cookies;
        const uid = parseInt(cookies.find((cookie) => cookie.key === "UID").value);

        return {
            cookie: cookieJar.getCookieStringSync("https://chaoxing.com"),
            uid: uid,
        };
    } else {
        throw new Error(response.mes);
    }
}

export async function isCookieValid(cookie: string) {
    const response: string = await axios.get("http://i.mooc.chaoxing.com/space/", {
        headers: {
            Cookie: cookie,
            "User-Agent": PC_AGENT,
        },
        params: {
            rss: 1,
            catalogId: 0,
            start: 0,
            size: 500,
        },
    });

    try {
        return response.includes("用户登录") ? false : true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCourses(cookie: string): Promise<string> {
    return await axios.get("https://mooc2-ans.chaoxing.com/visit/courses/list", {
        headers: {
            Cookie: cookie,
            "User-Agent": PC_AGENT,
        },
        params: {
            rss: 1,
            catalogId: 0,
            start: 0,
            size: 500,
        },
    });
}

export async function getActivities({
    cookie,
    courseId,
    classId,
    uid,
}: IGetActivities): Promise<IGetActivitiesReturn> {
    return await axios.get(`https://mobilelearn.chaoxing.com/ppt/activeAPI/taskactivelist`, {
        headers: {
            Cookie: cookie,
            "User-Agent":
                "Dalvik/2.1.0 (Linux; U; Android 10; MI 8 MIUI/V12.0.3.0.QEACNXM) com.chaoxing.mobile/ChaoXingStudy_3_4.7.4_android_phone_593_53 (@Kalimdor)_df14728a529c4e608a7b8f1112ca2825",
        },
        params: {
            courseId,
            classId,
            uid,
        },
    });
}

export async function figureSignType(cookie: string, activeId: number | string) {
    const response: IActivityDetail = await axios.get(
        "https://mobilelearn.chaoxing.com/v2/apis/active/getPPTActiveInfo",
        {
            headers: {
                Cookie: cookie,
                "User-Agent": MOBILE_AGENT,
            },
            params: {
                activeId,
            },
        },
    );

    if (!response) {
        const err = "查询签到详情时遇到问题，activeId: " + activeId;
        throw new Error(err);
    }

    let taskType: SignType = undefined;
    let location = null;

    const {
        otherId,
        ifphoto,
        ifopenAddress,
        locationText,
        locationLatitude,
        locationLongitude,
        locationRange,
    } = response;

    switch (otherId) {
        case 2:
            taskType = "qrcode";
            break;

        case 3:
            taskType = "gesture";
            break;

        case 4:
            taskType = "location";

            // 是指定位置的签到
            if (ifopenAddress) {
                location = {
                    address: locationText,
                    lat: locationLatitude,
                    lon: locationLongitude,
                    range: locationRange,
                };
            }
            break;

        default:
            taskType = ifphoto ? "picture" : "normal";
            break;
    }

    return {
        taskType,
        location,
    };
}

export async function sign({ cookie, activeId, uid }: ISign): Promise<string> {
    return await axios.get("https://mobilelearn.chaoxing.com/pptSign/stuSignajax", {
        headers: {
            Cookie: cookie,
            "User-Agent":
                "Dalvik/2.1.0 (Linux; U; Android 10; MI 8 MIUI/V12.0.3.0.QEACNXM) com.chaoxing.mobile/ChaoXingStudy_3_4.7.4_android_phone_593_53 (@Kalimdor)_df14728a529c4e608a7b8f1112ca2825",
        },
        params: {
            activeId,
            uid,
            latitude: -1,
            longitude: -1,
            appType: 15,
            fid: 0,
        },
    });
}

// /** 获取连接学习通 easemob 即时通信的 token */
// export async function getImToken(cookie: string) {
//     const response: string = await axios.get("https://im.chaoxing.com/webim/me", {
//         headers: {
//             Cookie: cookie,
//             "User-Agent": PC_AGENT,
//         },
//         responseType: "text",
//     });

//     const htmlDom = new JSDOM(response).window.document;
//     const token = htmlDom.querySelector("#myToken").textContent;

//     return token;
// }

/** 获取连接学习通 easemob 即时通信的 token */
export async function pushToOnebot({
    address,
    targetType,
    identifier,
    message,
}: {
    address: string;
    targetType: "group" | "friend";
    identifier: string;
    message: string;
}) {
    const url = address + "/" + targetType === "group" ? "send_group_msg" : "friend_message";

    const response: string = await axios.post(url, {
        headers: {},
        data: {
            [targetType === "group" ? "group" : "user" + "_id"]: identifier,
            message: [
                {
                    type: "text",
                    data: { text: message },
                },
            ],
        },
        responseType: "json",
    });

    const status = response;

    return status;
}

export async function pushToServerChan() {}
