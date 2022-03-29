<template>
  <div id="activities-container">
    <div id="get-course-button">
      <el-button type="success" @click="getCourses()" icon="el-icon-check"
        >获取所有课程</el-button
      >
    </div>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <div class="course-container">
          <el-card
            v-for="(course, index) in courses"
            :key="index"
            shadow="hover"
          >
            <div slot="header">
              <div class="course-header">{{ course.courseName }}</div>
            </div>

            <div class="course-info">
              <div>
                <el-tag type="info">课程ID</el-tag>
                {{ course.courseId }}
              </div>
              <div style="margin-top: 8px">
                <el-tag type="info">班级ID</el-tag>
                {{ course.classId }}
              </div>
            </div>

            <div class="course-action">
              <el-button
                type="primary"
                plain
                @click="enableItemEdit('create', course)"
                class="course-create-button"
                >添加至队列</el-button
              >
              <el-button
                type="success"
                plain
                @click="getActivities(course)"
                class="course-check-button"
                >查看活动</el-button
              >
            </div>
          </el-card>
        </div>
      </el-col>

      <el-col :span="12">
        <div id="activity-container">
          <el-card
            v-for="(activity, index) in activities"
            :key="index"
            shadow="hover"
          >
            <div>
              {{ activity.nameOne }}
            </div>
            <div>{{ activity.groupId === 1 ? "进行中" : "已结束" }}</div>
            <div>{{ formatDateTime(activity.startTime) }}</div>

            <!-- todo 判断是否已经签到过，签到过不允许再次签到 -->
            <!-- todo 只允许签到签到活动 -->
            <el-button
              v-if="activity.groupId === 1"
              type="primary"
              @click="sign(activity)"
              class="course-sign-button"
              >签到</el-button
            >
          </el-card>
        </div>

        <template v-if="hasGetActivities && !activities.length">
          该课程活动获取成功，并无对应活动
        </template>
      </el-col>
    </el-row>
  </div>
</template>


<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import eventBus from "@renderer/EventBus";
import { WithLogNotify } from "../mixins/common";

import { formatDateTime } from "@src/utils/common";
import { getCourses, getActivities } from "@src/utils/requests";
import { sign } from "@src/utils/sign";
import taskModule from "@store/task";

@Component({})
export default class Activities extends mixins(WithLogNotify) {
  courses: ICourse[] = [];
  activities: Activity[] = [];

  formatDateTime = formatDateTime;

  hasGetActivities = false;

  async sign(activity: Activity) {
    const response = await sign(activity);

    this.handleSignResponse(response);
  }

  async getCourses() {
    this.courses = await getCourses();
  }

  async getActivities(course: ICourse) {
    try {
      if (!this.hasGetActivities) {
        this.hasGetActivities = true;
      }

      this.activities = await getActivities(course);

      this.withLogNotify({
        level: "success",
        title: "成功",
        message: "活动获取成功",
      });
    } catch (error) {
      this.withLogNotify({
        level: "error",
        title: "活动获取失败",
        message: error,
      });
    }
  }

  enableItemEdit(action: "create", item: ICourse) {
    taskModule.enableItemEdit({ action, item });
  }

  created() {
    eventBus.$on("fake-course", () => {
      this.courses = [
        {
          courseName: "一门课程",
          courseId: 123,
          classId: 123,
        },
      ];
    });

    eventBus.$on("fake-activities", () => {
      this.activities = [
        {
          nameOne: "签到任务1",
          activeType: 2,
          startTime: new Date(),
          groupId: 1,
        },
        {
          nameOne: "签到任务2",
          activeType: 2,
          startTime: new Date(),
        },
        {
          nameOne: "非签到任务",
          activeType: 2,
          startTime: new Date(),
        },
      ] as any;
    });

    eventBus.$on("empty-activities", () => {
      this.activities = [];
      this.hasGetActivities = true;
    });

    eventBus.$on("back-to-normal", () => {
      this.courses = [];
      this.activities = [];
      this.hasGetActivities = false;
    });
  }
}
</script>

<style lang="postcss" scoped>
#get-course-button {
  display: flex;
  justify-content: center;
}

.el-card {
  margin-bottom: 8px;
  border-radius: 10px;
}

.course-header {
  text-align: center;
  font-size: 24px;
}

.course-info {
  font-size: 18px;
  /* display: flex;
  flex-direction: column;
  align: center; */
}

.course-action {
  /* border-top: 1px solid #ebeef5; */
  padding-top: 16px;
  display: flex;
  justify-content: center;
}
</style>