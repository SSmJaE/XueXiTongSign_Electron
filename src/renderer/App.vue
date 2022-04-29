<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="登录">
        <Login />
      </el-tab-pane>

      <el-tab-pane label="活动">
        <Activities />
      </el-tab-pane>

      <el-tab-pane label="任务">
        <Table />
      </el-tab-pane>

      <el-tab-pane label="日志">
        <Log />
      </el-tab-pane>

      <el-tab-pane label="推送">
        <Push />
      </el-tab-pane>
    </el-tabs>

    <TaskForm />
    <OnebotForm />
    <Disclaimer />

    <!-- <iframe src="https://im.chaoxing.com/webim/me"></iframe> -->
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import { WithLogNotify } from "./mixins/common";

import Activities from "./pages/Activities.vue";
import Log from "./pages/Log.vue";
import Login from "./pages/Login.vue";
import Table from "./pages/Table.vue";
import Push from "./pages/Push.vue";
import TaskForm from "./components/TaskForm.vue";
import OnebotForm from "./components/OnebotForm.vue";
import Disclaimer from "./components/Disclaimer.vue";

import { ObjectEntries, sleep } from "@src/utils/common";
import db from "@src/utils/database";
import logger from "@src/utils/logger";
import watcher from "@src/utils/watcher";
import { sign } from "@src/utils/sign";
import taskModule from "@store/task";
import userModule from "@store/user";
import pushModule from "@store/push";
import { getActivities } from "@src/utils/requests";
import axios from "axios";

const tasksCollection = db.get("tasks");

import { remote } from "electron";
import * as moduleRequests from "@main/requests";
// import { setupWebIm } from "@src/utils/im";
// import * as moduleIm from "@main/im";

const remoteRequests: typeof moduleRequests =
  remote.getGlobal("remoteRequests");
// const remoteIm: typeof moduleRequests = remote.getGlobal("remoteIm");

@Component({
  components: {
    Activities,
    Log,
    Login,
    Table,
    Push,
    TaskForm,
    OnebotForm,
    Disclaimer,
  },
})
export default class App extends mixins(WithLogNotify) {
  created() {
    taskModule.clearDuplicatedSigned();

    taskModule.getTasks();
    // 每次启动时也应解析一次，删除过期的时间范围
    taskModule.parseUTC();
    pushModule.getTasks();

    watcher.on("normal", async (task, activity) => {
      const status = await sign(activity);

      this.handleSignResponse(status);

      logger.success(`normal类型签到成功`);

      new Notification("签到小工具", {
        body: `${task.courseName}签到成功`,
      });

      taskModule.saveSigned(activity.id);
    });

    watcher.on("location", async (task, activity) => {
      await sign(activity);

      logger.success(`location类型签到成功`);

      taskModule.saveSigned(activity.id);
    });

    watcher.on("gesture", async (task, activity) => {
      await sign(activity);

      logger.success(`gesture类型签到成功`);

      taskModule.saveSigned(activity.id);
    });

    watcher.on("picture", async (task, activity) => {
      await sign(activity);

      logger.success(`picture类型签到成功`);

      taskModule.saveSigned(activity.id);
    });

    ipcRenderer.on("log", (...params) => {
      console.log(params);
      const log = params[0] as any as ILog;

      if (log.level === "success" || log.level === "error") {
        this.withLogNotify({
          level: log.level,
          title: `操作${log.level === "success" ? "成功" : "失败"}`,
          message: log.message,
        });
      } else {
        logger.log(log);
      }
    });

    ipcRenderer.on("sign", (...params) => {
      console.log(params);
    });

    // if (userModule.watchMethod.im) {
    //   setTimeout(this.connectIM, 10_000);
    // }
    // setupWebIm();

    this.startHeartBeat();

    logger.success("初始化成功");

    // this.intro();
  }

  async startHeartBeat() {
    let lastHeartBeatTime = 0;
    let lastRefreshTime = 0;

    while (true) {
      // 需要frequency至少为1秒
      // 休眠频率应小于1s，保证即使大量task时，仍能严格维持1s的task监控频率
      await sleep(500);

      // 获取unix
      const current = Math.floor(Date.now() / 1000);

      if (lastRefreshTime === 0 || current - lastRefreshTime > 60) {
        logger.debug("检测当前活跃任务");
        this.refreshActiveTasks();
        lastRefreshTime = current;
      }

      if (lastHeartBeatTime === 0 || current - lastHeartBeatTime > 9.5) {
        logger.debug("任务队列心跳");
        lastHeartBeatTime = current;
      }

      for (const [taskId, { UTC, lastCheckTime, frequency }] of ObjectEntries(
        taskModule.parsedUTC
      )) {
        if (UTC) {
          for (const [start, end] of UTC) {
            if (start <= current && current <= end) {
              // 每个task有自己的检测频率
              const differ = current - lastCheckTime;

              // console.log({
              //   taskId,
              //   differ,
              //   lastCheckTime,
              //   current,
              //   start,
              //   end,
              // });

              if (differ > frequency) {
                // 不await
                this.checkActivity(taskId);

                db.get("parsedUTC")
                  .get(taskId)
                  .set("lastCheckTime", current)
                  .write();
              }
            }
          }
        }
      }
    }
  }

  /** 检测是否有新的活动，有的话emit给watcher，触发事件响应 */
  async checkActivity(taskId: string) {
    // 根据taskId获取课程信息
    const task = tasksCollection.find({ id: taskId }).value();

    const course: ICourse = {
      courseName: task.courseName,
      courseId: task.courseId,
      classId: task.classId,
    };

    logger.info(`检测${task.courseName}的签到活动`);

    // 获取当前课程的所有活动
    const activities = await getActivities(course);

    if (!activities) {
      logger.error(`${task.courseName} 活动获取失败`);
      return;
    }

    // 判断是否有新活动
    const signedActivities = taskModule.signedActivities;

    const newActivities = activities.filter(
      (activity) =>
        !signedActivities.includes(activity.id) &&
        activity.activeType === 2 && // 筛选签到任务
        activity.groupId === 1 // 筛选「进行中」的任务
    );

    if (newActivities.length) {
      this.withLogNotify({
        level: "success",
        title: "有新签到",
        message: `检测到${task.courseName}的新签到活动`,
      });
      //汇报给 onebot
      const onebotConf: IOnebotConf = db.get("onebot").value();
      if (onebotConf.enable)
        axios.post(
          onebotConf.address,
          {
            // group_id: onebotConf.groupId,
            message: `检测到${task.courseName}的新签到活动`,
          },
          {
            auth: onebotConf.auth,
          }
        );
    } else {
      logger.info(`${task.courseName}无新签到`);
    }

    for (const activity of newActivities) {
      // 如果有新活动，判断活动类型，emit
      // const activityType = this.figureSignType(activity);

      // const checkinInfo = await getCheckinDetail(cookie, aid);
      // const sleepTime = getRandomIntInclusive(20, 35);
      // if (checkinInfo.type !== "qr") {
      //   info("收到", checkinInfo.type, "类型签到，延迟时间", sleepTime, "秒");
      //   let messageToSend = `收到 ${courseName} 的签到\n类型：${checkinInfo.type}\naid:${aid}\n将在 ${sleepTime} 秒后自动签到`;
      //   if (checkinInfo.location) {
      //     messageToSend += `\n这是位置范围签到\n地址：${checkinInfo.location.address}\n精度：${checkinInfo.location.range}\n经纬度：${checkinInfo.location.lon},${checkinInfo.location.lat}`;
      //   }
      //   pushQMsg(messageToSend);
      //   setTimeout(async () => {
      //     pushQMsg(await handleSign(aid, courseId, checkinInfo));
      //   }, sleepTime * 1000);
      // } else {
      //   info("收到二维码签到");
      //   pushQMsg(
      //     `收到 ${courseName} 的二维码签到，aid 为 ${aid}，需要提供一张二维码`
      //   );
      // }
      // watcher.emit(activityType, task, activity);
      watcher.emit("normal", task, activity);
    }
  }

  refreshActiveTasks() {
    const buffer: string[] = [];

    const current = Math.floor(Date.now() / 1000);

    for (const [taskId, { UTC }] of ObjectEntries(taskModule.parsedUTC)) {
      if (UTC) {
        for (const [start, end] of UTC) {
          if (start <= current && current <= end) {
            const currentCourseName = db
              .get("tasks")
              .find({ id: taskId })
              .get("courseName")
              .value();

            buffer.push(currentCourseName);
          }
        }
      }
    }

    taskModule.refreshActiveTasks(buffer);
    logger.debug(`当前活跃任务 ${buffer.length ? buffer.join("，") : "无"}`);
  }

  // async connectIM() {
  //   try {
  //     const uid = userModule.user.uid;
  //     const cookie = userModule.user.cookie;
  //     const token = await remoteRequests.getImToken(cookie);

  //     ipcRenderer.send("connect", uid, cookie, token);
  //   } catch (error) {
  //     this.withLogNotify({
  //       level: "error",
  //       title: "IM服务连接失败",
  //       message: error,
  //     });
  //   }
  // }
}
</script>
