interface ILoginReturn {
    mes: string;
    type: number;
    url: string;
    status: boolean;
}

interface IGetCourses {}

interface IGetActivities {
    courseId: string | number;
    classId: string | number;
    uid: string | number;
}

interface IGetActivitiesReturn {
    errorMsg: string;
    groupList: Group[];
    activeList: Activity[];
    count: number;
    status: number;
    result: number;
}

interface ISign {
    uid: string | number;
    activeId: string | number;
}

interface Activity {
    nameTwo: string;
    groupId: number;
    isLook: number;
    releaseNum: number;
    url: string;
    picUrl: string;
    attendNum: number;
    activeType: number;
    nameOne: string;
    startTime: number;
    id: number;
    status: number;
    nameFour: string;
    extraInfo: ExtraInfo;
}

interface ExtraInfo {
    noticeId: number;
}

interface Group {
    classId: string;
    content: string;
    courseId: string;
    createTime: null;
    fid: string;
    id: number;
    isDelete: number;
    name: string;
    sort: number;
    type: number;
    uid: string;
    updateTime: null;
}
