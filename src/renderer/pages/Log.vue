<template>
  <div>
    <el-select v-model="logLevel" placeholder="日志等级">
      <el-option
        v-for="level in logLevels"
        :key="level"
        :label="level"
        :value="level"
      >
      </el-option>
    </el-select>

    <span>自动下滑</span>
    <el-switch v-model="autoSlide"> </el-switch>

    <div
      id="log-container"
      :style="{
        height: '550px',
        width: '100%',
        overflowY: 'auto',
      }"
    >
      <div v-for="(log, index) in displayedLogs" :key="index">
        <span>{{ formatDateTime(log.time) }}</span>
        <el-tag>{{ log.level }}</el-tag>
        <span>{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import logger, { LOG_LEVELS } from "@src/utils/logger";
import { formatDateTime } from "@src/utils/common";

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

  formatDateTime = formatDateTime;

  mounted() {
    this.container = document.querySelector("#log-container");
  }
}
</script>

