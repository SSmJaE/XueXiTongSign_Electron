interface ICourse {
    courseName: string;
    courseId: string | number;
    classId: string | number;
}

interface ITask {
    // 自增
    // 或者uuid
    id?: string;

    courseName: string;

    courseId: number;

    classId: number;

    /** 只签到，还是也强答什么的 */
    targetActiveType: [2];

    /** 从什么时候监听到什么时候 */
    dateRange: [Date, Date];

    // 一周可以有多次课程
    // 一天也可以有多次课程
    // courseTime: {
    //     1: [{ start: "10:00"; end: "12:00" }];
    //     3: [{ start: "10:00"; end: "12:00" }, { start: "14:00"; end: "16:00" }];
    // };
    // courseTime: {
    //     [key: number]: { day: number; timeRange: [Date, Date] };
    // };
    courseTime: {
        key: number;
        day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        timeRange: [string, string];
    }[];

    /** 只签选中的类型 */
    activeSignType: ["普通", "手势", "二维码", "定位", "图片"];

    /** 图片base64编码保存只数据库，防止后期路径更改
     *
     * 所以还要做到解码图片，在app中显示出来？
     */
    images: string[];

    /** 定位信息，至少提供一个定位 */
    locations: any[];

    /** 开启随机定位之后，在所有定位信息中随机选择一个 */
    randomLocation: boolean;

    /** 查询/心跳间隔，单位秒 */
    frequency: number;

    /** 签到延时 */
    signDelay: number;
}

interface IUser {
    // 不管登录，还是cookie，最终获取到的uid都是唯一的，可以作为主键
    uid: number;
    account: string;
    password: string;
    cookie: string;
    lastUpdateTime: Date;
    hasTakenGuide: boolean;
}

interface IParsedDetail {
    /** unix，单位秒，而不是毫秒 */
    UTC: [number, number][];
    frequency: number;
    lastCheckTime: number;
}

interface IParsedUTC {
    [taskId: string]: IParsedDetail;
}

interface IOnebotConf {
    enable: boolean;
    address: string;
    // groupId: number;
    auth?: {
        username: string;
        password: string;
    };
}

interface IWatchMethod {
    interval: boolean;
    im: boolean;
}

interface IPushLevel {
    onlySign: boolean;
    log: boolean;
    logLevel: LoggerLevel;
}

interface IServerChan {
    enable: boolean;
}
interface IDataBase {
    user: IUser;
    tasks: ITask[];
    parsedUTC: IParsedUTC;
    signedActivities: number[];
    watch: IWatchMethod;
    push: {
        level: IPushLevel;
        onebot: IOnebotConf;
        serverChan: IServerChan;
        onebotTargets: {
            type: "group" | "friend";
            id: number;
        }[];
    };
}

type LoggerLevel = "debug" | "info" | "warning" | "error" | "success";

interface ILog {
    level: LoggerLevel;
    time?: Date;
    message: string;
}

type SignType = "normal" | "location" | "gesture" | "picture" | "qrcode";

interface IOnebotTarget {
    id?: string;
    type: "group" | "friend";
    identifier?: number;
}
