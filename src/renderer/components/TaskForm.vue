<template>
  <el-dialog
    title="签到任务"
    :visible.sync="ItemEditDialogVisibility"
    width="700px"
    id="task-form"
  >
    <el-form
      :model="itemBuffer"
      :rules="rules"
      ref="itemEditForm"
      label-width="100px"
      class="demo-itemBuffer"
    >
      <el-form-item label="事件类型" prop="targetActiveType">
        <el-row>
          <el-checkbox
            v-for="([type, config], index) in Object.entries(targetActiveTypes)"
            :key="index"
            v-model="itemBuffer.targetActiveType"
            :label="config.value"
            border
            :style="{ marginRight: '5px' }"
            :disabled="config.disabled"
            >{{ type }}
          </el-checkbox>
        </el-row>
      </el-form-item>

      <el-form-item label="日期范围" prop="daterange" id="form-date-range">
        <el-date-picker
          v-model="itemBuffer.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="签到类型" prop="activeSignType">
        <el-row>
          <!-- <el-col > -->
          <el-checkbox
            v-for="(type, index) in activeSignTypes"
            :key="index"
            v-model="itemBuffer.activeSignType"
            :label="type"
            border
            :style="{ marginRight: '5px' }"
          >
          </el-checkbox>
          <!-- </el-col> -->
        </el-row>
      </el-form-item>

      <el-form-item label="监控频率" prop="frequency" id="form-frequency">
        <el-input-number
          v-model="itemBuffer.frequency"
          :min="60"
          :step="10"
        ></el-input-number>
      </el-form-item>

      <div id="form-course-time-container">
        <el-form-item
          v-for="(course, index) in itemBuffer.courseTime"
          label="上课时间"
          :key="course.key"
          :prop="`courseTime[${index}]`"
          :rules="{
            required: true,
            message: '域名不能为空',
            trigger: 'blur',
          }"
        >
          <el-row>
            <el-col :span="4">
              <el-select
                v-model.number="itemBuffer.courseTime[index].day"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in days"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="16" class="form-course-time-range">
              <el-time-picker
                is-range
                v-model="itemBuffer.courseTime[index].timeRange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择课程时间"
              >
              </el-time-picker>
            </el-col>

            <el-col :span="4">
              <el-button @click.prevent="removeCourseTime(index)"
                >删除</el-button
              ></el-col
            >
          </el-row>
        </el-form-item>
      </div>

      <template
        v-if="
          itemBuffer &&
          itemBuffer.activeSignType &&
          itemBuffer.activeSignType.includes('位置')
        "
      >
        <el-form-item label="定位设置" :prop="locations">
          <el-input
            v-model="itemBuffer.locations[0]"
            placeholder="请输入经度"
          ></el-input>
          <el-input
            v-model="itemBuffer.locations[0]"
            placeholder="请输入纬度"
          ></el-input>
        </el-form-item>
      </template>
      <template v-else> 123312312 </template>

      <el-form-item>
        <!-- <el-button @click="cancelItemEdit()">取消</el-button> -->
        <el-row type="flex" justify="space-between">
          <el-col>
            <el-button @click="addCourseTime()">添加上课时间</el-button>
          </el-col>
          <el-col>
            <el-row type="flex" justify="end">
              <el-button @click="resetItemEdit()">重置</el-button>
              <el-button type="primary" @click="confirmItemEdit()" id="form-confirm-button">
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

import taskModule from "@src/renderer/store/task";

interface ICourseTime {}

function validateActiveType() {}

@Component({})
export default class TaskForm extends Vue {
  $refs: {
    itemEditForm: ElForm;
  };

  targetActiveTypes = {
    签到: { value: 2 },
    通知: { value: 2, disabled: true },
    抢答: { value: 2, disabled: true },
  };

  activeSignTypes = ["普通", "手势", "定位", "图片"];

  dynamicCourseTimes: ICourseTime[] = [];

  days = [
    {
      value: 1,
      label: "周一",
    },
    {
      value: 2,
      label: "周二",
    },
    {
      value: 3,
      label: "周三",
    },
    {
      value: 4,
      label: "周四",
    },
    {
      value: 5,
      label: "周五",
    },
    {
      value: 6,
      label: "周六",
    },
    {
      value: 7,
      label: "周日",
    },
  ];

  validateCourseTime() {}

  rules = {
    name: [
      { required: true, message: "请输入活动名称", trigger: "blur" },
      { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
    ],
    region: [{ required: true, message: "请选择活动区域", trigger: "change" }],
    date1: [
      {
        type: "date",
        required: true,
        message: "请选择日期",
        trigger: "change",
      },
    ],
    date2: [
      {
        type: "date",
        required: true,
        message: "请选择时间",
        trigger: "change",
      },
    ],
    type: [
      {
        type: "array",
        required: true,
        message: "请至少选择一个活动性质",
        trigger: "change",
      },
    ],
    resource: [
      { required: true, message: "请选择活动资源", trigger: "change" },
    ],
    desc: [{ required: true, message: "请填写活动形式", trigger: "blur" }],
  };

  get action() {
    return taskModule.action;
  }

  get itemBuffer() {
    return taskModule.itemBuffer;
  }

  get ItemEditDialogVisibility() {
    return taskModule.ItemEditDialogVisibility;
  }

  set ItemEditDialogVisibility(_) {
    taskModule.cancelItemEdit();
  }

  resetItemEdit() {
    this.$refs.itemEditForm.resetFields();
  }

  confirmItemEdit() {
    this.$refs.itemEditForm.validate(async (valid, fail) => {
      console.log(valid);
      if (valid) {
        if (this.action == "create") {
          taskModule.createItem();
        } else {
          taskModule.updateItem();
        }

        taskModule.cancelItemEdit();

        taskModule.getTasks();
        taskModule.parseUTC();
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
    this.itemBuffer.courseTime.push({
      key: newKey,
      day: 1,
      timeRange: undefined,
    });
  }

  removeCourseTime(index: number) {
    this.itemBuffer.courseTime.splice(index, 1);
  }
}
</script>

<style>
</style>