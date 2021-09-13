import axios from "axios";
import queryString from "query-string";
import axiosCookieJarSupport from "axios-cookiejar-support";
import tough from "tough-cookie";

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

function generateUserAgent(platform: "desktop" | "mobile") {}

if (process.env.NODE_ENV === "development") {
    // axios.defaults.proxy = { host: "127.0.0.1", port: 8866 };
}

const PC_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36";

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
