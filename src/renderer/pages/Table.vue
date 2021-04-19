<template>
  <el-table :data="tasks" style="width: 100%" row-key="id">
    <el-table-column label="课程名称">
      <template slot-scope="scope">
        {{ scope.row.courseName }}
      </template>
    </el-table-column>

    <el-table-column label="日期范围">
      <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{
          scope.row.dateRange.map((date) => formatDate(date)).join("至")
        }}</span>
      </template>
    </el-table-column>

    <el-table-column label="上课时间" width="180">
      <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <div v-for="courseTime in scope.row.courseTime" :key="courseTime.key">
            周{{ courseTime.day }}
            {{
              courseTime.timeRange.map((date) => formatTime(date)).join("至")
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

    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="mini" @click="enableItemEdit('update', scope.row)"
          >编辑</el-button
        >
        <el-button size="mini" type="danger" @click="deleteItem(scope.row)"
          >删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

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
}
</script>

<style>
</style>