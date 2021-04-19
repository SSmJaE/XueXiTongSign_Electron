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
      小工具唯一发布地址 https://github.com/SSmJaE/XueXiTonsSign_Electron
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
      <el-button @click="dialogVisibility = false" type="primary">
        接受并使用
      </el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import taskModule from "@src/renderer/store/task";

@Component({})
export default class TaskForm extends Vue {
  dialogVisibility = true;
}
</script>

<style>
</style>