<template>
  <el-dialog
    id="onebot-form"
    title="Onebot推送"
    :visible.sync="ItemEditDialogVisibility"
    width="700px"
  >
    <el-form
      :model="itemBuffer"
      ref="itemEditForm"
      label-width="100px"
      class="demo-itemBuffer"
    >
      <!-- :rules="rules" -->
      <el-form-item
        label="推送目标"
        v-for="(target, index) in itemBuffer"
        :key="target.id"
        :prop="`[${index}]`"
        :rules="{
          required: true,
          message: '目标不能为空',
          trigger: 'blur',
        }"
      >
        <el-row>
          <el-col :span="4"
            ><el-select v-model="target.type" placeholder="请选择">
              <el-option
                v-for="option in options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
              </el-option>
            </el-select>
          </el-col>

          <el-col :span="16">
            <el-input
              v-model="target.identifier"
              placeholder="群号/QQ号"
              :style="{ width: '300px' }"
            ></el-input>
          </el-col>

          <el-col :span="4">
            <el-button @click.prevent="removeCourseTime(index)"
              >删除</el-button
            ></el-col
          >
        </el-row>
      </el-form-item>

      <el-form-item>
        <!-- <el-button @click="cancelItemEdit()">取消</el-button> -->
        <el-row type="flex" justify="space-between">
          <el-col>
            <el-button @click="addCourseTime()">添加推送目标</el-button>
          </el-col>
          <el-col>
            <el-row type="flex" justify="end">
              <el-button @click="resetItemEdit()">重置</el-button>
              <el-button
                type="primary"
                @click="confirmItemEdit()"
                id="form-confirm-button"
              >
                {{ action === "create" ? "创建" : "修改" }}
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ElForm } from "node_modules/element-ui/types/form";

import pushModule from "@src/renderer/store/push";

@Component({})
export default class OnebotForm extends Vue {
  $refs: {
    itemEditForm: ElForm;
  };

  options: { label: string; value: string }[] = [
    {
      label: "群",
      value: "group",
    },
    {
      label: "好友",
      value: "friend",
    },
  ];

  get action() {
    return pushModule.action;
  }

  get itemBuffer() {
    return pushModule.itemBuffer;
  }

  get ItemEditDialogVisibility() {
    return pushModule.ItemEditDialogVisibility;
  }

  set ItemEditDialogVisibility(_) {
    pushModule.cancelItemEdit();
  }

  resetItemEdit() {
    this.$refs.itemEditForm.resetFields();
  }

  confirmItemEdit() {
    this.$refs.itemEditForm.validate(async (valid, fail) => {
      console.log(valid);
      if (valid) {
        // if (this.action == "create") {
        //   pushModule.createItem();
        // } else {
        pushModule.updateItem();
        // }

        pushModule.cancelItemEdit();
        pushModule.getTasks();
      } else {
        console.log(fail);
        this.$notify({
          title: "错误",
          message: `表单提交失败，未满足填写要求`,
          type: "error",
        });
      }
    });
  }

  addCourseTime() {
    const newKey = Math.random();
    // todo 是否直接在此处修改vuex中的state呢？
    this.itemBuffer.push({
      id: `${Math.random()}`.slice(2),
      type: "group",
      // day: 1,
      // timeRange: undefined,
    });
  }

  removeCourseTime(index: number) {
    this.itemBuffer.splice(index, 1);
  }
}
</script>

<style>
</style>