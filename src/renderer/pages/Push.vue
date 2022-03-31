<template>
  <div id="login-container">
    <el-row style="margin-bottom: 16px">
      <el-card shadow="hover">
        <div class="section-title">消息推送等级</div>
        <el-radio :label="3">只推送签到情况(成功/失败)</el-radio>

        <el-row>
          <el-col :span="6">
            <el-radio :label="6">日志等级 success & error</el-radio>
          </el-col>

          <el-col :span="6">
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
            </div>
          </el-col>
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

          <el-row>启用</el-row>

          <el-row>
            <el-col :span="6"> Onebot协议端地址 </el-col>
            <el-col :span="16">
              <el-input> </el-input>
            </el-col>
          </el-row>

          <div>
            <div v-for="(target, index) in onebotTargets" :key="index">
              <span>类型 {{ target.type }}</span>
              <span>{{ target.identifier }}</span>
            </div>
          </div>

          <el-button @click="enableItemEdit('update')"
            >编辑推送目标列表</el-button
          >
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div class="section-title">Server酱推送</div>
          <el-row>启用</el-row>
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

const remoteRequests: typeof moduleRequests =
  remote.getGlobal("remoteRequests");

@Component({})
export default class Login extends mixins(WithLogNotify) {
  enableItemEdit(action: "update") {
    pushModule.enableItemEdit({ action });
  }

  // 从db同步，无引用
  account = userModule.user.account;
  password = userModule.user.password;
  cookie = userModule.user.cookie;

  isValid = false;

  @Watch("cookie")
  onCookieChange() {
    this.isValid = false;
  }

  async created() {
    if (this.cookie) {
      const isValid = await this.isCookieValid(this.cookie);
    } else {
      this.withLogNotify({
        level: "error",
        title: "未提供Cookie",
        message: "请登录，或者手动替换有效cookie",
      });
    }
  }

  get onebotTargets() {
    return pushModule.onebotTargets;
  }

  async checkCookie() {
    if (this.cookie) {
      const isValid = await this.isCookieValid(this.cookie);
      this.isValid = isValid;
    } else {
      this.withLogNotify({
        level: "error",
        title: "Cookie无效",
        message: "Cookie不能为空",
      });
    }
  }

  async updateCookie() {
    const uid = /UID=(\d*)/.exec(this.cookie)![1];

    // 同步至db
    userModule.updateUser({
      uid: parseInt(uid),
      cookie: this.cookie,
    });

    this.withLogNotify({
      level: "success",
      title: "操作成功",
      message: "cookie替换成功",
    });
  }

  async login() {
    try {
      const { cookie, uid } = await remoteRequests.login(
        this.account,
        this.password
      );

      // 同步至db
      userModule.updateUser({
        account: this.account,
        password: this.password,
        uid,
        cookie,
      });

      this.cookie = cookie;
    } catch (error) {
      this.withLogNotify({
        level: "error",
        title: "登录失败",
        message: error,
      });
    }
    //检测cookie有效性
  }

  async isCookieValid(cookie: string) {
    const isValid = await remoteRequests.isCookieValid(cookie);

    if (isValid) {
      this.withLogNotify({
        level: "success",
        title: "Cookie有效",
      });
    } else {
      this.withLogNotify({
        level: "error",
        title: "Cookie失效",
        message: "请重新登录，或者手动替换有效cookie",
      });
    }

    return isValid;
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
</style>