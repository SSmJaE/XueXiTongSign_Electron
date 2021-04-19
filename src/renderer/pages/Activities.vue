<template>
  <div>
    <el-button type="primary" @click="getCourses()">获取所有课程</el-button>
    <el-row>
      <el-col :span="12">
        <el-card v-for="(course, index) in courses" :key="index">
          <div>课程 {{ course.courseName }}</div>
          <div>courseId {{ course.courseId }}</div>
          <div>classId {{ course.classId }}</div>
          <el-button type="primary" @click="enableItemEdit('create', course)"
            >添加至队列</el-button
          >
          <el-button type="primary" @click="getActivities(course)"
            >查看活动</el-button
          >
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card v-for="(activity, index) in activities" :key="index">
          <div>
            {{ activity.nameOne }}
          </div>
          <div>{{ activity.activeType }}</div>
          <div>{{ formatDateTime(activity.startTime) }}</div>

          <!-- todo 判断是否已经签到过，签到过不允许再次签到 -->
          <!-- todo 只允许签到签到活动 -->
          <el-button type="primary" @click="sign(activity)">签到</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>


<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";

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

  async sign(activity: Activity) {
    const response = await sign(activity);

    this.handleSignResponse(response);
  }

  async getCourses() {
    this.courses = await getCourses();
  }

  async getActivities(course: ICourse) {
    this.activities = await getActivities(course);
  }

  enableItemEdit(action: "create", item: ICourse) {
    taskModule.enableItemEdit({ action, item });
  }
}
</script>
