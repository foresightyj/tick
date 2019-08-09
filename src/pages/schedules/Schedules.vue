<template>
  <div>
    <el-input
      ref="searchFilter"
      class="search-filter"
      v-model="schedule_filter"
      placeholder="Search tasks..."
      autofocus
    />
    <Help />
    <br />
    <br />
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane v-for="section in sections" :key="section.title" :name="section.title">
        <span slot="label">
          <el-badge :value="section.schedules.length" class="item" :type="section.badgeType">
            <i class="el-icon-date"></i>
            {{section.title}}
          </el-badge>
        </span>
        <el-table
          row-key="id"
          :data="section.schedules"
          style="width: 100%"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="期限" width="160">
            <template slot-scope="scope">
              <EditableTime
                :disabled="scope.row.completed"
                :iconClass="!scope.row.isDue?'el-icon-time':'el-icon-timer'"
                :value="scope.row.due"
                @input="onDueChanged(scope.row, $event)"
              />
            </template>
          </el-table-column>
          <el-table-column label="任务" width="400">
            <template slot-scope="scope">
              <EditableInput
                :disabled="scope.row.completed"
                :value="scope.row.task"
                @input="onTaskChanged(scope.row, $event)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button
                plain
                size="small"
                :style="{color: 'red'}"
                icon="el-icon-delete"
                @click="onRemove(scope.row, $event)"
                title="Ctrl+click或者Alt+click无确认删除"
              >删除</el-button>
              <el-button
                plain
                size="small"
                :style="{color: 'green'}"
                icon="el-icon-check"
                v-if="!scope.row.completed"
                @click="onComplete(scope.row)"
              >完成</el-button>
              <el-button
                plain
                size="small"
                icon="el-icon-magic-stick"
                :style="{color: 'blue'}"
                v-if="scope.row.completed"
                @click="onRecover(scope.row)"
              >复活</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss">
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.search-filter {
  padding: 0 50px 0 150px;
  width: 400px;
  margin: 0 auto;
}

.el-badge__content.is-fixed {
  top: 10px;
  right: 8px;
  line-height: 16px;
}
</style>

<script lang="ts">
import assert from "assert";
import Vue from "vue";
import "element-ui/lib/theme-chalk/index.css";
import { Scheduler } from "../../scheduler/Scheduler";
import { Schedule } from "../../entity/Schedule";
const { ipcRenderer, remote } = require("electron");
import moment from "moment";
import EditableInput from "./EditableInput.vue";
import EditableTime from "./EditableTime.vue";
import Help from "./Help.vue";

require("../../scheduler/extendDateJs");

import { Button, Table, TableColumn, Input, Dropdown, DropdownItem, DropdownMenu, MessageBox, Message, Tabs, TabPane, Badge } from "element-ui";
import { rowCallbackParams } from "element-ui/types/table";
import { ipcMain } from 'electron';

const scheduler = remote.getGlobal("scheduler") as Scheduler;
assert(scheduler, "scheduler is falsy");

interface Section {
  title: string,
  badgeType: "primary" | "warning" | "danger" | "info" | "success" | undefined,
  background: string,
  schedules: Schedule[]
}

export default Vue.extend({
  name: "app",
  components: {
    [Button.name]: Button,
    [Input.name]: Input,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Dropdown.name]: Dropdown,
    [Tabs.name]: Tabs,
    [TabPane.name]: TabPane,
    [Badge.name]: Badge,
    EditableInput,
    EditableTime,
    Help,
  },

  data() {
    return {
      schedule_filter: "",
      schedules: [] as Schedule[],
      activeName: 'Today',
    };
  },
  computed: {
    searchFilter(): Input {
      const i = this.$refs.searchFilter;
      assert(i, '$refs.searchFilter is falsy');
      return i as Input;
    },
    sections(): Section[] {
      let startOfToday = moment().startOf('day').toDate()
      let startOf3DaysAgo = moment().subtract(3, 'days').startOf('day').toDate()
      let startOfTomorrow = moment().add(1, 'days').startOf('day').toDate()
      let startOfTheDayAfterTomorrow = moment().add(1, 'days').startOf('day').toDate()

      let schedules_Today = this.schedules.filter(s => s.due >= startOfToday && s.due < startOfTomorrow);
      let schedules_Tomorrow = this.schedules.filter(s => s.due >= startOfTomorrow && s.due < startOfTheDayAfterTomorrow);
      let schedules_TheDayAfterTomorrow = this.schedules.filter(s => s.due >= startOfTheDayAfterTomorrow);
      let schedules_InPast3Days = this.schedules.filter(s => s.due >= startOf3DaysAgo && s.due < startOfToday);
      let schedules_MoreThan3DaysAgo = this.schedules.filter(s => s.due < startOf3DaysAgo);

      if (this.schedule_filter) {
        schedules_Today = schedules_Today.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1);
        schedules_Tomorrow = schedules_Tomorrow.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1);
        schedules_TheDayAfterTomorrow = schedules_TheDayAfterTomorrow.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1);
        schedules_InPast3Days = schedules_InPast3Days.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1);
        schedules_MoreThan3DaysAgo = schedules_MoreThan3DaysAgo.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1);
      }

      const comparisonFunc = (a: Schedule, b: Schedule) => a.due.getTime() - b.due.getTime();
      schedules_Today.sort(comparisonFunc);
      schedules_Tomorrow.sort(comparisonFunc);
      schedules_TheDayAfterTomorrow.sort(comparisonFunc);
      schedules_InPast3Days.sort(comparisonFunc);
      schedules_MoreThan3DaysAgo.sort(comparisonFunc);

      const res: Section[] = [{
        title: 'Today',
        badgeType: undefined,
        background: '#f0ffff',
        schedules: schedules_Today
      } as Section,
      {
        title: 'Tomorrow',
        badgeType: "primary",
        background: '#f2f2f2',
        schedules: schedules_Tomorrow
      } as Section,
      {
        title: 'Upcoming',
        badgeType: "success",
        background: '#f2f2f2',
        schedules: schedules_TheDayAfterTomorrow
      } as Section,
      {
        title: 'Past 3 days',
        badgeType: "warning",
        background: '#f2f2f2',
        schedules: schedules_InPast3Days
      } as Section,
      {
        title: 'Due past but uncompleted',
        badgeType: "warning",
        background: '#f2f2f2',
        schedules: schedules_MoreThan3DaysAgo
      } as Section].filter(s => s.schedules.length);
      return res;
    }
  },
  async mounted() {
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      console.log('code', e.key, e.keyCode, e.code);
      if (e.code === "Escape") {
        if (this.schedule_filter) {
          this.schedule_filter = "";
        } else {
          ipcRenderer.send("schedules-escape");
        }
      } else if (e.code === "KeyF" && e.ctrlKey && !e.altKey && !e.shiftKey) {
        this.searchFilter.focus();
      } else if ("1234567890".includes(e.key) && !e.ctrlKey && e.altKey && !e.shiftKey) {
        const key = parseInt(e.key, 10);
        let section: Section | undefined;
        if (key === 9) {
          //last section
          section = this.sections[this.sections.length - 1];
        }
        else {
          section = this.sections[key - 1];
        }
        if (section) {
          this.activeName = section.title;
        }
      }
    }, true);
    const schedules = await scheduler.list();
    this.schedules = schedules;
    console.log("schedules", schedules);
    scheduler.addListener("added", this.onScheduleAdded);
    scheduler.addListener("due_updated", this.onScheduleUpdated);
    scheduler.addListener("task_updated", this.onScheduleUpdated);
    scheduler.addListener("link_titles_updated", this.onScheduleUpdated);
    scheduler.addListener("completed", this.onScheduleUpdated);
  },
  destroyed() {
    scheduler.removeListener("added", this.onScheduleAdded);
    scheduler.removeListener("due_updated", this.onScheduleUpdated);
    scheduler.removeListener("task_updated", this.onScheduleUpdated);
    scheduler.removeListener("link_titles_updated", this.onScheduleUpdated);
    scheduler.removeListener("completed", this.onScheduleUpdated);
  },
  methods: {
    onScheduleAdded(schedule: Schedule) {
      assert(schedule);
      this.schedules.push(schedule);
    },
    onScheduleUpdated(schedule: Schedule) {
      assert(schedule);
      const idx = this.schedules.findIndex(s => s.id === schedule.id);
      if (idx > -1) {
        this.schedules.splice(idx, 1, schedule);
      }
    },
    tableRowClassName(row: rowCallbackParams) {
      const schedule = row.row as Schedule;
      if (schedule.isDue) {
        return "warning-row";
      } else {
        return "success-row";
      }
    },
    onDueChanged(schedule: Schedule, event: Date) {
      assert(schedule);
      schedule.due = event;
      this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1, schedule);
      scheduler.update_due(schedule);
    },
    async onTaskChanged(schedule: Schedule, event: string) {
      assert(schedule);
      schedule.task = event;
      const s = await scheduler.update_task(schedule);
      this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1, s);
    },
    async onRemove(schedule: Schedule, event: MouseEvent) {
      const noConfirm = event.ctrlKey || event.altKey;
      assert(schedule);
      try {
        if (!noConfirm) {
          await MessageBox.confirm('此操作将永久删除该任务, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        }
        scheduler.remove(schedule);
        this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1);
        if (!noConfirm) Message.success({ type: 'success', message: '删除成功!' });
      } catch (err) {
        console.log("cancel deleting task");
      }
    },
    async onComplete(schedule: Schedule) {
      assert(schedule);
      const s = await scheduler.complete(schedule);
      this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1, s);
      Message.success({ type: 'success', message: '完成任务' });
    },
    async onRecover(schedule: Schedule) {
      assert(schedule);
      const s = await scheduler.recover(schedule);
      this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1, s);
      Message.info({ type: 'success', message: '复活任务' });
    }
  }
});
</script>
