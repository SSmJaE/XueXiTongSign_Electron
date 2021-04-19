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
    </el-tabs>

    <TaskForm />
    <Disclaimer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import { WithLogNotify } from "./mixins/common";

import Activities from "./pages/Activities.vue";
import Log from "./pages/Log.vue";
import Login from "./pages/Login.vue";
import Table from "./pages/Table.vue";
import TaskForm from "./components/TaskForm.vue";
import Disclaimer from "./components/Disclaimer.vue";

import { ObjectEntries, sleep } from "@src/utils/common";
import db from "@src/utils/database";
import logger from "@src/utils/logger";
import watcher from "@src/utils/watcher";
import { sign } from "@src/utils/sign";
import taskModule from "@src/renderer/store/task";
import { getActivities } from "@src/utils/requests";

const tasksCollection = db.get("tasks");

@Component({
  components: {
    Activities,
    Log,
    Login,
    Table,
    TaskForm,
    Disclaimer,
  },
})
export default class App extends mixins(WithLogNotify) {
  created() {
    taskModule.clearDuplicatedSigned();

    taskModule.getTasks();
    // 每次启动时也应解析一次，删除过期的时间范围
    taskModule.parseUTC();

    watcher.on("normal", async (task, activity) => {
      const status = await sign(activity);

      this.handleSignResponse(status);

      logger.success(`normal类型签到成功`);

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

    this.startHeartBeat();

    logger.success("初始化成功");
  }

  async startHeartBeat() {
    let lastHeartBeatTime = 0;

    while (true) {
      // 需要frequency至少为1秒
      // 休眠频率应小于1s，保证即使大量task时，仍能严格维持1s的task监控频率
      await sleep(500);

      // 获取unix
      const current = Math.floor(Date.now() / 1000);

      if (current - lastHeartBeatTime > 9.5) {
        logger.debug("心跳 in heartBeart");
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
      (activity) => !signedActivities.includes(activity.id)
    );

    for (const activity of newActivities) {
      // 如果有新活动，判断活动类型，emit
      // const activityType = this.figureSignType(activity);

      // watcher.emit(activityType, task, activity);
      watcher.emit("normal", task, activity);
    }
  }
}
</script>
