<template>
  <div id="login-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="hover" style="margin-bottom: 16px">
          <el-input
            v-model="account"
            placeholder="请输入账号"
            style="margin-bottom: 16px"
          ></el-input>
          <el-input
            v-model="password"
            placeholder="请输入密码"
            style="margin-bottom: 16px"
          ></el-input>

          <div class="login-button-container">
            <el-button id="login-button" type="primary" @click="login()"
              >登录</el-button
            >
          </div>
        </el-card>

        <el-card shadow="hover">
          <div>
            <el-tooltip
              class="item"
              effect="dark"
              content="两种检测签到的方式，可以同时启用，并不冲突"
              placement="top"
            >
              <div class="watch-method-title">监控方式</div>
            </el-tooltip>
            <div class="watch-method-choice">
              <el-tooltip
                class="item"
                effect="dark"
                content="当课程在设定的时间范围内，间隔一定时间查询是否有签到"
                placement="bottom"
              >
                <el-checkbox
                  :value="watchMethod.interval"
                  @change="updateWatchMethod('interval', $event)"
                  label="间隔查询"
                  border
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="通过超星接口，自动接收对应课程的签到任务，且当课程在设定的时间范围内，进行签到"
                placement="bottom"
              >
                <el-checkbox
                  :value="watchMethod.im"
                  @change="updateWatchMethod('im', $event)"
                  label="接受推送"
                  border
                  disabled
                />
              </el-tooltip>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover">
          <el-input
            type="textarea"
            :rows="8"
            placeholder="请输入Cookie"
            v-model="cookie"
            style="margin-bottom: 16px"
          >
          </el-input>

          <div class="cookie-action-container">
            <el-button
              id="cookie-check-button"
              type="primary"
              @click="checkCookie()"
              >检测cookie</el-button
            >
            <el-button
              id="cookie-update-button"
              type="primary"
              @click="updateCookie()"
              :disabled="!isValid"
              >替换cookie</el-button
            >
          </div>
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

import * as moduleRequests from "@main/requests";
import { remote } from "electron";

const remoteRequests: typeof moduleRequests =
  remote.getGlobal("remoteRequests");

@Component({})
export default class Login extends mixins(WithLogNotify) {
  // 从db同步，无引用
  account = userModule.user.account;
  password = userModule.user.password;
  cookie = userModule.user.cookie;
  watchMethod = userModule.watchMethod;

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

  updateWatchMethod(watchMethod: keyof IWatchMethod, status: boolean) {
    // 同步至db
    userModule.updateWatchMethod({
      [watchMethod]: status,
    });
  }
}
</script>

<style lang="postcss" scoped>
.el-card {
  border-radius: 10px;
}

.login-button-container {
  display: flex;
  justify-content: center;

  #login-button {
    width: 150px;
  }
}

.cookie-action-container {
  display: flex;
  justify-content: center;
}

.watch-method-title {
  font-size: 24px;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.watch-method-choice {
  display: flex;
  justify-content: center;
}
</style>
