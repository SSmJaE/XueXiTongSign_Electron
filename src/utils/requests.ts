import { remote } from "electron";
import * as moduleRequests from "@main/requests";

import userModule from "@store/user";
import { formatDateTime } from "./common";

const remoteRequests: typeof moduleRequests = remote.getGlobal("remoteRequests");

export async function getCourses() {
    const response = await remoteRequests.getCourses(userModule.user.cookie);
    console.log(response);

    const PARSER = new DOMParser();
    const htmlDom = PARSER.parseFromString(response, "text/html");

    const courseNodes = htmlDom.querySelectorAll<HTMLElement>(
        ".course.clearfix.catalog_0.learnCourse",
    );

    const courses: ICourse[] = [];

    for (const course of courseNodes) {
        const courseName = course.querySelector(".course-name").getAttribute("title");

        const courseId = course.querySelector(".courseId").getAttribute("value");

        const classId = course.querySelector(".clazzId").getAttribute("value");

        courses.push({
            courseName,
            courseId,
            classId,
        });
    }

    console.log("课程获取成功");

    return courses;
}

export async function getActivities(course: ICourse) {
    const activities: Activity[] = [];

    const response = await remoteRequests.getActivities({
        cookie: userModule.user.cookie,
        uid: userModule.user.uid,
        courseId: course.courseId,
        classId: course.classId,
    });

    console.log(response);

    const errorMsg = response.errorMsg;

    if (errorMsg) {
        throw new Error(`${course.courseName} ${errorMsg}`);
    }

    const activeList = response["activeList"];

    for (const activity of activeList) {
        // todo 不明白这有什么用
        // if (activity.includes("nameTwo")) {
        //   console.log("not in ");
        //   continue;
        // }

        // todo 可以把所有已签到成功的数据写入数据库，签到之前验证一下
        // if (this.hasSigned.includes(activity["id"])) continue;

        // and activity['status'] == 1
        // status为1，则为未签到
        if (activity["activeType"] == 2) {
            const startTime = formatDateTime(activity.startTime);

            console.log(`${startTime} ${course.courseName}`);

            // signUrl = activity['url']  # 签到目标url
            // this.sign(activity);
            activities.push(activity);

            // await sleep(1);
        }
    }

    return activities;
}
