import store from "./index";
import { getModule, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import db from "@src/utils/database";
import logger from "@src/utils/logger";
import { ObjectEntries } from "@src/utils/common";
import dayjs from "dayjs";

import dayOfYear from "dayjs/plugin/dayOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

const tasksCollection = db.get("tasks");
const signedCollection = db.get("signedActivities");

const defaultTask: ITask = {
    courseName: "undefined",
    courseId: 1234,
    classId: 55555,
    targetActiveType: [2],
    dateRange: [new Date("2021-04-01"), new Date("2021-06-01")],
    courseTime: [
        {
            key: Math.random(),
            day: 1,
            timeRange: undefined,
        },
    ],
    activeSignType: ["普通", "手势", "二维码", "定位", "图片"],
    images: ["asdfsd"],
    locations: [{}],
    randomLocation: false,
    frequency: 60,
    signDelay: 5,
};

@Module({
    namespaced: true,
    name: "task",
    store,
    dynamic: true,
})
export class TaskModule extends VuexModule {
    tasks: ITask[] = [];

    @Mutation
    createItem() {
        tasksCollection.push(this.itemBuffer).write();
    }

    @Mutation
    deleteTask(id: string) {
        tasksCollection.remove({ id }).write();

        this.getTasks();
        this.parseUTC();
    }

    @Mutation
    updateItem() {
        tasksCollection
            .find({ id: this.itemBuffer.id })
            .assign(this.itemBuffer)
            .write();
    }

    @Mutation
    getTasks() {
        // arrayLike并不能触发vue的reactive，必须是纯种array
        const tasks = [...tasksCollection.value()];

        this.tasks = tasks;

        logger.info("更新items");
    }

    get signedActivities() {
        return signedCollection.value();
    }

    @Mutation
    saveSigned(activityId: number) {
        signedCollection.push(activityId).write();
    }

    /** 清理重复的activityId */
    @Mutation
    clearDuplicatedSigned() {
        db.set(
            "signedActivities",
            Array.from(new Set(Array.from(db.get("signedActivities").value()))).sort(),
        ).write();
    }

    activeTasks: string[] = [];

    @Mutation
    refreshActiveTasks(activeTasks: string[]) {
        this.activeTasks = activeTasks;
    }

    parsedUTC: IParsedUTC = {};

    /**
     * 根据courseTime解析UTC
     *
     * 根据日期范围和上课时间，生成utc数组
     *
     * 并且合并冲突的时间段，跳过无效日期范围(相对于当前日期)
     *
     * 这样比较时，就只需要简单的start <= current <= end即可
     *
     * 只需要比较数字大小，省去了大量的Date对象的操作
     */
    @Mutation
    parseUTC() {
        // 清空
        this.parsedUTC = db.set("parsedUTC", {}).write();

        for (const task of this.tasks) {
            const currentDate = new Date();
            const dateEnd = task.dateRange[1];

            // 跳过今天之前的时间段，没有意义
            if (dateEnd < currentDate) {
                continue;
            }

            const buffer: [number, number][] = [];

            const dayBuffer: { [day: number]: [Date, Date][] } = {};

            for (const { day, timeRange } of task.courseTime) {
                // 合并周天(相同星期合并至一个object下)
                if (!dayBuffer[day]) {
                    dayBuffer[day] = [];
                }

                dayBuffer[day].push(
                    timeRange.map((timeString) => new Date(timeString)) as [Date, Date],
                );
            }

            const mergedDayBuffer: {
                [day: number]: [Date, Date][];
            } = {};

            for (const [day, timeRangeList] of ObjectEntries(dayBuffer)) {
                // 先排序end，再排序start
                const sortedRangeList = timeRangeList
                    .sort((a, b) => a[1].getTime() - b[1].getTime())
                    .sort((a, b) => a[0].getTime() - b[0].getTime());

                const extendBuffer: [Date, Date][] = [];

                // 判断时只通过时间判断，但是保存时需要保存日期，方便之后生成UTC时使用
                let currentStart: [string, Date] = undefined;
                let currentEnd: [string, Date] = undefined;

                const length = sortedRangeList.length;
                for (const [index, [start, end]] of sortedRangeList.entries()) {
                    // 只提取时间，不需要日期信息
                    const startTime = dayjs(start).format("HH:mm:ss");
                    const endTime = dayjs(end).format("HH:mm:ss");

                    //如果一共只有一个timeRange
                    if (length === 1) {
                        extendBuffer.push([start, end]);
                    } else {
                        if (!(currentStart && currentEnd)) {
                            // 第一次迭代时
                            currentStart = [startTime, start];
                            currentEnd = [endTime, end];
                        } else {
                            // 是否有重合时间段
                            // 因为sort了两次，所以只需要判断start的情况，不需要判断end
                            if (currentStart[0] <= startTime && startTime <= currentEnd[0]) {
                                if (endTime > currentEnd[0]) {
                                    // 如果有，合并重复时间段
                                    currentEnd = [endTime, end];
                                }
                            } else {
                                // 如果没有重合
                                extendBuffer.push([currentStart[1], currentEnd[1]]);

                                // 则是一个新的时间片段
                                currentStart = [startTime, start];
                                currentEnd = [endTime, end];
                            }

                            if (index === length - 1) {
                                extendBuffer.push([currentStart[1], currentEnd[1]]);
                            }
                        }
                    }
                }

                mergedDayBuffer[day] = extendBuffer;
            }

            // 转为UTC
            // 拼接日期周期+星期的哪一天+时间范围
            const start = dayjs(task.dateRange[0]);
            const end = dayjs(task.dateRange[1]);

            const startYear = start.year();
            // 跳过过期时间
            const startDayOfYear = Math.max(start.dayOfYear(), dayjs().dayOfYear());

            const endYear = end.year();
            const endDayOfYear = end.dayOfYear();

            for (const [day, timeRangeList] of ObjectEntries(mergedDayBuffer)) {
                for (const [startTimeRange, endTimeRange] of timeRangeList) {
                    // 在日期周期内的每一天
                    for (let year = startYear; year <= endYear; year++) {
                        for (
                            // 针对跨年
                            let dayOfYear = year == startYear ? startDayOfYear : 0;
                            dayOfYear <= (year == endYear ? endDayOfYear : 365);
                            dayOfYear++
                        ) {
                            const currentDate = dayjs()
                                .year(year)
                                .dayOfYear(dayOfYear);
                            // 每一个对应的星期的天
                            // 使用ISO标准，周一对应1，周二对应2
                            const dayOfWeek = currentDate.isoWeekday();

                            // 允许字符串和number比较
                            if (dayOfWeek == day) {
                                const startUTC = currentDate
                                    .hour(startTimeRange.getHours())
                                    .minute(startTimeRange.getMinutes())
                                    .second(startTimeRange.getSeconds())
                                    .unix();

                                const endUTC = currentDate
                                    .hour(endTimeRange.getHours())
                                    .minute(endTimeRange.getMinutes())
                                    .second(endTimeRange.getSeconds())
                                    .unix();

                                // 都要生成一次时间范围
                                buffer.push([startUTC, endUTC]);
                            }
                        }
                    }
                }
            }

            const sortedUTC = buffer.sort((a, b) => a[1] - b[1]).sort((a, b) => a[0] - b[0]);

            const parsedDetail: IParsedDetail = {
                UTC: sortedUTC,
                frequency: task.frequency,
                lastCheckTime: Math.floor(Date.now() / 1000),
            };

            this.parsedUTC = db
                .get("parsedUTC")
                .set(task.id, parsedDetail)
                .write();
        }
    }

    action: "create" | "update" = "create";
    itemBuffer: ITask = {} as ITask;
    ItemEditDialogVisibility: boolean = false;

    enableItemEdit(option: { action: "create"; item: ICourse }): void;
    enableItemEdit(option: { action: "update"; item: ITask }): void;
    @Mutation
    enableItemEdit({ action, item }: { action: "create" | "update"; item?: ITask | ICourse }) {
        this.action = action;

        if (action === "create") {
            this.itemBuffer = JSON.parse(
                JSON.stringify({
                    ...defaultTask,
                    ...item, // course信息
                    id: `${Math.random()}`.slice(2), // lodash的set，不能有"."，会被识别为path
                }),
            );
        } else {
            this.itemBuffer = JSON.parse(JSON.stringify(item));
        }

        //显示修改对话框
        this.ItemEditDialogVisibility = true;
    }

    @Mutation
    cancelItemEdit() {
        this.ItemEditDialogVisibility = false;
    }

    @Mutation
    fakeTask(task: ITask) {
        this.tasks = [task];
    }
}

export default getModule(TaskModule);
