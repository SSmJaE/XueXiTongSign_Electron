<template>
  <div>
    <el-select v-model="logLevel" placeholder="日志等级" id="log-level">
      <el-option
        v-for="level in logLevels"
        :key="level"
        :label="level"
        :value="level"
      >
      </el-option>
    </el-select>

    <span id="log-auto-slide">
      <span>自动下滑</span>
      <el-switch v-model="autoSlide"> </el-switch>
    </span>

    <span id="log-active-courses">
      <span>当前活跃课程</span>
      <span v-for="courseName in activeTasks" :key="courseName">{{
        courseName
      }}</span>
    </span>

    <span v-if="!activeTasks.length"> 无 </span>

    <div
      id="log-container"
      :style="{
        height: '550px',
        width: '100%',
        overflowY: 'auto',
      }"
    >
      <div class="log" v-for="(log, index) in displayedLogs" :key="index">
        <span>{{ formatDateTime(log.time) }}</span>
        <span class="tag-container">
          <el-tag
            size="medium"
            effect="dark"
            :type="log.level === 'error' ? 'danger' : log.level"
            >{{ log.level }}</el-tag
          >
        </span>
        <span>{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import logger, { LOG_LEVELS } from "@src/utils/logger";
import { formatDateTime } from "@src/utils/common";
import taskModule from "@store/task";

@Component({})
export default class Log extends Vue {
  logs = logger.logs;
  logLevel: LoggerLevel = "debug";
  logLevels = Object.keys(LOG_LEVELS);

  autoSlide = true;

  get displayedLogs() {
    const currentLevel = LOG_LEVELS[this.logLevel];

    return this.logs.filter((log) => LOG_LEVELS[log.level] >= currentLevel);
  }

  container: Element = null;

  get logLength() {
    return this.logs.length;
  }

  @Watch("logLength")
  onLogsChange() {
    // this.container.scrollBy(0, 1000);
    if (this.autoSlide) {
      this.$nextTick(() => {
        this.container.scrollTop =
          this.container.scrollHeight - this.container.clientHeight;
      });
    }
  }

  get activeTasks() {
    return taskModule.activeTasks;
  }

  formatDateTime = formatDateTime;

  mounted() {
    this.container = document.querySelector("#log-container");
  }
}
</script>

<style lang="postcss">
.log {
  margin-bottom: 5px;

  .tag-container {
    width: 80px;
    display: inline-flex;
    justify-content: center;
  }
}
</style>