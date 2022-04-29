<template>
  <div id="login-container">
    <el-row style="margin-bottom: 16px">
      <el-card shadow="hover">
        <div class="section-title">消息推送等级</div>
        <el-checkbox
          label="只推送签到情况(成功/失败)"
          :value="pushLevel.onlySign"
          @change="updatePushLevel('onlySign', $event)"
          border
          style="margin-bottom: 8px"
        ></el-checkbox>

        <el-row>
          <!-- <el-col :span="3"> -->
          <el-checkbox
            label="日志等级"
            :value="pushLevel.log"
            @change="updatePushLevel('log', $event)"
            border
          >
          </el-checkbox>
          <!-- </el-col> -->

          <!-- <el-col :span="21"> -->
          <!-- <div> -->
          <el-select
            :disabled="!pushLevel.log"
            :value="pushLevel.logLevel"
            @change="updatePushLevel('logLevel', $event)"
            placeholder="日志等级"
            style="width: 100px"
          >
            <el-option
              v-for="level in logLevels"
              :key="level"
              :label="level"
              :value="level"
            >
            </el-option>
          </el-select>
          <!-- </div> -->
          <!-- </el-col> -->
        </el-row>
      </el-card>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <el-row class="section-title">
            <!-- <div > -->
            Onebot推送
            <el-tooltip content="请自行确保Onebot服务正常运行">
              <i class="el-icon-question"></i>
            </el-tooltip>
            <!-- </div> -->
          </el-row>

          <el-row class="entry-row">
            <el-col :span="6"> 启用 </el-col>
            <el-col :span="16">
              <el-switch
                :value="onebotEnable"
                @change="updateOnebotConf('enable', $event)"
              >
              </el-switch>
            </el-col>
          </el-row>

          <el-row class="entry-row">
            <el-col :span="6"> 协议端地址 </el-col>
            <el-col :span="16">
              <el-input size="small" placeholder="http://host:port/" />
            </el-col>
          </el-row>

          <!-- <div> -->
          <!-- <div v-for="(target, index) in onebotTargets" :key="index">
              <span>类型 {{ target.type }}</span>
              <span>{{ target.identifier }}</span>
            </div> -->

          <el-table :data="onebotTargets" style="width: 100%">
            <el-table-column prop="type" label="类型"> </el-table-column>
            <el-table-column prop="identifier" label="号码"> </el-table-column>
          </el-table>
          <!-- </div> -->

          <el-button @click="enableItemEdit('update')"
            >编辑推送目标列表</el-button
          >
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div class="section-title">Server酱推送</div>
          <el-row class="entry-row">启用</el-row>
          地址<el-input></el-input>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import { WithLogNotify } from "../mixins/common";

import userModule from "@store/user";
import pushModule from "@store/push";

import * as moduleRequests from "@main/requests";
import { remote } from "electron";
import { LOG_LEVELS } from "@src/utils/logger";

const remoteRequests: typeof moduleRequests =
  remote.getGlobal("remoteRequests");

@Component({})
export default class Login extends mixins(WithLogNotify) {
  logLevels = Object.keys(LOG_LEVELS);

  enableItemEdit(action: "update") {
    pushModule.enableItemEdit({ action });
  }

  // 从db同步，无引用
  pushLevel = pushModule.pushLevel;
  onebotConf = pushModule.onebotConf;
  serverChan = pushModule.serverChan;

  get onebotEnable() {
    return this.onebotConf.enable;
  }

  updatePushLevel(level: keyof IPushLevel, status: boolean) {
    // 同步至db
    console.log(status);

    pushModule.updatePushLevel({
      [level]: status,
    });
  }

  updateOnebotConf(level: keyof IOnebotConf, status: boolean) {
    // 同步至db
    console.log(status);

    pushModule.updateOnebotConf({
      [level]: status,
    });
  }

  updateServerChan(level: keyof IServerChan, status: boolean) {
    // 同步至db
    console.log(status);

    pushModule.updateServerChan({
      [level]: status,
    });
  }

  get onebotTargets() {
    return pushModule.onebotTargets;
  }
}
</script>

<style lang="postcss" scoped>
.el-card {
  border-radius: 10px;
}

.section-title {
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.entry-row {
  font-size: 18px;
  display: flex;
  align-items: center;
}
</style>