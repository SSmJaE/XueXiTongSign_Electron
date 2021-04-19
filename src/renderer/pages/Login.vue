<template>
  <div>
    <el-input v-model="account" placeholder="请输入账号"></el-input>
    <el-input v-model="password" placeholder="请输入密码"></el-input>
    <el-button type="primary" @click="login()">登录</el-button>
    <el-input
      type="textarea"
      :rows="8"
      placeholder="请输入Cookie"
      v-model="cookie"
    >
    </el-input>
    <el-button type="primary" @click="checkCookie()">检测cookie</el-button>
    <el-button type="primary" @click="updateCookie()" :disabled="!isValid"
      >替换cookie</el-button
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import { WithLogNotify } from "../mixins/common";

import userModule from "@store/user";

import * as moduleRequests from "@main/requests";
import { remote } from "electron";
const remoteRequests: typeof moduleRequests = remote.getGlobal(
  "remoteRequests"
);

@Component({})
export default class Login extends mixins(WithLogNotify) {
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
    // const uid=

    // 同步至db
    userModule.updateUser({
      // uid,
      // cookie,
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

<style>
</style>