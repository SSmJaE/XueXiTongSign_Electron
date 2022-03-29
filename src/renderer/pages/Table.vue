<template>
  <el-table :data="tasks" style="width: 100%" row-key="id" id="task-table">
    <el-table-column label="课程名称" width="400">
      <template slot-scope="scope">
        {{ scope.row.courseName }}
      </template>
    </el-table-column>

    <el-table-column label="日期范围" >
      <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{
          scope.row.dateRange.map((date) => formatDate(date)).join(" 至 ")
        }}</span>
      </template>
    </el-table-column>

    <el-table-column label="上课时间" width="250">
      <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <div v-for="courseTime in scope.row.courseTime" :key="courseTime.key">
            周{{ courseTime.day }}
            {{
              courseTime.timeRange.map((date) => formatTime(date)).join(" 至 ")
            }}
          </div>
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium">{{
              Array.from(
                new Set(scope.row.courseTime.map((item) => `周${item.day}`))
              ).join("，")
            }}</el-tag>
          </div>
        </el-popover>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="160">
      <template slot-scope="scope">
        <div class="task-actions">
          <el-button
            size="mini"
            @click="enableItemEdit('update', scope.row)"
            class="task-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" @click="deleteItem(scope.row)"
            >删除</el-button
          >
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import eventBus from "@renderer/EventBus";

import taskModule from "@store/task";
import { formatDate, formatTime } from "@src/utils/common";

@Component({})
export default class Table extends Vue {
  get tasks() {
    return taskModule.tasks;
  }

  formatDate = formatDate;
  formatTime = formatTime;

  enableItemEdit(action: "update", item: ITask) {
    taskModule.enableItemEdit({ action, item });
  }

  deleteItem(row: ITask) {
    console.log(row);
    taskModule.deleteTask(row.id);
  }

  created() {
    eventBus.$on("fake-tasks", () => {
      taskModule.fakeTask({
        courseName: "某门课程",
        courseId: 211345835,
        classId: 37600759,
        targetActiveType: [2],
        dateRange: ["2021-04-01T00:00:00.000Z", "2021-06-01T00:00:00.000Z"],
        courseTime: [
          {
            key: 0.18471351413648462,
            day: 4,
            timeRange: ["2021-04-15T08:36:38.000Z", "2021-04-15T13:36:38.000Z"],
          },
        ],
      } as any);
    });

    eventBus.$on("back-to-normal", () => {
      taskModule.getTasks();
    });
  }
}
</script>

<style>
</style>