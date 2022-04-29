<template>
  <el-dialog
    :visible.sync="dialogVisibility"
    title="声明"
    width="700px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    center
  >
    <div>
      小工具唯一发布地址 https://github.com/SSmJaE/XueXiTongSign_Electron
    </div>
    <div>建议严格设置监控时间段，并且设置较大的检测频率</div>
    <div>防止给服务器带来压力，己所不欲，勿施于人</div>
    <div>感谢李恒道提供的支持</div>

    <br />
    <div>
      本项目基于GPL-3.0，完全开源，免费，仅供技术学习和交流，开发者团队并未授权任何组织、机构以及个人将其用于商业或者盈利性质的活动。也从未使用本项目进行任何盈利性活动。未来也不会将其用于开展营利性业务。
    </div>
    <div>
      个人或者组织，机构如果使用本项目产生的各类纠纷，法律问题，均由其本人承担。
    </div>
    <div>
      如果您开始使用本项目，即视为同意项目免责声明中的一切条款，条款更新不再另行通知。
    </div>
    <div>如有触及相关平台规定或者权益，烦请联系我们删除。</div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="accept()" type="primary"> 接受并使用 </el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import introJs from "intro.js";
import "intro.js/minified/introjs.min.css";

import { Component, Vue } from "vue-property-decorator";

import eventBus from "@renderer/EventBus";

import taskModule from "@src/renderer/store/task";
import userModule from "@src/renderer/store/user";

@Component({})
export default class TaskForm extends Vue {
  dialogVisibility = true;

  accept() {
    this.dialogVisibility = false;
    this.$nextTick(() => {
      this.intro();
    });
  }

  intro() {
    userModule.user.hasTakenGuide ||
      introJs()
        .setOptions({
          showProgress: true,
          showBullets: false,
          disableInteraction: true,
          nextLabel: "继续",
          prevLabel: "返回",
          exitOnOverlayClick: true,
          steps: [
            {
              title: "你好",
              intro: "欢迎使用签到小工具 👋，此教程会简单介绍如何使用本工具",
            },
            {
              element: document.querySelector("#login-container"),
              intro:
                "首先，我们需要选择一种登录方式，最终目的都是获取有效的cookie",
            },
            {
              element: document.querySelector("#login-button"),
              intro:
                "如果选择通过账号密码登录，登录成功之后，会自动同步cookie，不需要再操作",
            },
            {
              element: document.querySelector("#cookie-check-button"),
              intro: "如果直接提供cookie，需要先验证cookie有效性",
            },
            {
              element: document.querySelector("#cookie-update-button"),
              intro: "验证成功后，点击替换cookie即可",
            },
            // index 5
            {
              intro: "接下来介绍活动部分",
            },
            // index 6
            {
              element: document.querySelector("#get-course-button"),
              intro:
                "在配置完成cookie，并且验证cookie有效性之后，首先，我们需要获取当前账号下的所有课程",
            },
            // index 7
            {
              element: document.querySelector(".course-container"),
              intro:
                "获取到课程之后，我们可以选择添加至任务队列，或者手动处理签到",
            },
            // index 8
            {
              element: document.querySelector(".course-create-button"),
              intro: "如果选择添加至任务队列，则会显示任务编辑表单",
            },
            {
              intro: "接下来介绍任务编辑表单",
            },
            // index 10
            {
              element: document.querySelector("#form-date-range"),
              intro:
                "选择合适的上课周期(最好和实际学期一致，或者和该门课的周期一致)",
            },
            {
              intro:
                "一门课程建议只配置一个任务，但是可以为该任务配置多个上课时间",
            },
            // 12
            {
              intro:
                "选择合适的上课时间(比如可以比实际上课时间提前半小时)，小工具会根据任务的周期和时间，自动优化整合时间范围，保证监控的效率和精确",
            },
            // 13
            {
              intro:
                "建议选择较大的监控频率(至少60s)，不然会被屏蔽，而获取不到活动信息",
            },
            // 14
            {
              intro: "添加任务之后，会立即生效，并不需要重启小工具",
            },
            // 15
            {
              intro: "如果选择手动处理签到",
            },
            {
              element: document.querySelector("#activity-container"),
              intro: "可以在此处看到所有该课程的签到活动",
            },
            // 17
            {
              intro: "可以手动对任意活动进行签到",
            },
            {
              element: document.querySelector("#activity-container"),
              intro: "有时一门课程，可能并没有对应的活动",
              position: "left",
            },
            // 19
            {
              intro: "接下来介绍任务部分",
            },
            // 20
            {
              intro: "可以在此处看到，所有队列中的任务",
            },
            // 21
            {
              intro: "编辑、删除任务之后，是即时生效的，不需要重启小工具",
            },
            // 22
            {
              intro: "编辑任务的表单的使用，和创建时一致",
            },
            // 23
            {
              intro: "接下来介绍日志部分",
            },
            // 24
            {
              intro: "这里包括了所有小工具内部的运行日志，以及用户的操作日志",
            },
            {
              intro: "可以选择日志等级",
            },
            // 26
            {
              intro: "也可以选择，当有新日志时，是否自动下移",
            },
            // 27
            {
              intro:
                "这里会显示当前活跃课程，活跃课程，即当前正在该课程的上课时间范围内",
            },
            // 28
            {
              intro: "介绍到此为止，祝你使用愉快👋，可以为我点一个star哦",
            },
          ],
        })
        .onbeforechange(function () {
          console.log(this._currentStep);
          console.log(this);

          switch (this._currentStep) {
            case 5: // 开始介绍活动页面
              document.querySelector<HTMLElement>("#tab-1").click();
              break;

            case 6: // 提前伪造，introJs的tick和vue并不一致
              eventBus.$emit("fake-course");
              break;

            case 7: // 伪造course 和 activities
              console.log(document.querySelector(".course-container"));
              break;

            case 8:
              this._introItems[this._currentStep].element =
                document.querySelector(".course-create-button");
              this._introItems[this._currentStep].position = "right";
              break;

            case 9: // 显示任务编辑表单
              taskModule.enableItemEdit({
                action: "create",
                item: {} as any,
              });
              break;

            case 10:
              this._introItems[this._currentStep].element =
                document.querySelector("#form-date-range");
              this._introItems[this._currentStep].position = "bottom";

              break;

            case 11:
              this._introItems[this._currentStep].element =
                document.querySelector("#form-course-time-container");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 12:
              this._introItems[this._currentStep].element =
                document.querySelector(".form-course-time-range");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 13:
              this._introItems[this._currentStep].element =
                document.querySelector("#form-frequency");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 14:
              this._introItems[this._currentStep].element =
                document.querySelector("#form-confirm-button");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 15:
              taskModule.cancelItemEdit();
              eventBus.$emit("fake-activities");

              this._introItems[this._currentStep].element =
                document.querySelector(".course-check-button");
              this._introItems[this._currentStep].position = "right";

              break;

            case 16:
              break;

            case 17:
              this._introItems[this._currentStep].element =
                document.querySelector(".course-sign-button");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 18:
              eventBus.$emit("empty-activities");
              break;

            case 19: // 开始介绍任务页面
              document.querySelector<HTMLElement>("#tab-2").click();
              eventBus.$emit("fake-tasks");

              break;

            case 20:
              this._introItems[this._currentStep].element =
                document.querySelector("#task-table");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 21:
              this._introItems[this._currentStep].element =
                document.querySelector(".task-actions");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 22:
              this._introItems[this._currentStep].element =
                document.querySelector(".task-edit");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 23: // 开始介绍日志页面
              document.querySelector<HTMLElement>("#tab-3").click();

              break;

            case 25:
              this._introItems[this._currentStep].element =
                document.querySelector("#log-level");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 26:
              this._introItems[this._currentStep].element =
                document.querySelector("#log-auto-slide");
              this._introItems[this._currentStep].position = "bottom";
              break;

            case 27:
              this._introItems[this._currentStep].element =
                document.querySelector("#log-active-courses");
              this._introItems[this._currentStep].position = "bottom";
              break;
          }
        })
        .oncomplete(function () {
          eventBus.$emit("back-to-normal");
          userModule.updateUser({ hasTakenGuide: true });
        })
        .start();
  }
}
</script>

<style>
</style>
