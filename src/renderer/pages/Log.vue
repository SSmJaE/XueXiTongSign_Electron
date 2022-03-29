<template>
  <div class="log-panel">
    <div class="action-container">
      <span id="log-level">
        <span class="action-label">日志筛选</span>
        <el-select v-model="logLevel" placeholder="日志等级">
          <el-option
            v-for="level in logLevels"
            :key="level"
            :label="level"
            :value="level"
          >
          </el-option>
        </el-select>
      </span>

      <span id="log-auto-slide">
        <span class="action-label">自动下滑</span>
        <el-switch v-model="autoSlide"> </el-switch>
      </span>

      <span id="log-active-courses">
        <span class="action-label">当前活跃课程</span>
        <span v-if="!activeTasks.length"> 无 </span>
        <span v-else>{{ activeTasks.join("， ") }}</span>
      </span>
    </div>

    <div id="log-container">
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

<style lang="postcss" scoped>
.log-panel {
  display: flex;
  flex-direction: column;
}

#log-level {
  padding-right: 16px;
  border-right: 1px solid #ebeef5;

  .el-select {
    width: 100px;
  }
}

#log-auto-slide {
  padding-left: 8px;
  padding-right: 16px;
  border-right: 1px solid #ebeef5;
}

#log-active-courses {
  padding-left: 8px;
}

.action-label {
  font-size: 18px;
  margin-right: 8px;
}

.action-container {
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

#log-container {
  height: 550px;
  margin-top: 16px;
  /* flex-grow: 1; */
  width: 100%;
  overflow-y: auto;
}

.log {
  margin-bottom: 5px;

  .tag-container {
    width: 80px;
    display: inline-flex;
    justify-content: center;
  }
}
</style>