<template>
  <div>
    <el-input v-model="schedule_filter" placeholder="Search..." autofocus></el-input>
    <div v-for="section in sections" :key="section.title">
      <div v-if="section.schedules.length">
        <h3>{{section.title}}</h3>
        <el-table :data="section.schedules" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column label="期限" width="240">
            <template slot-scope="scope">
              <el-date-picker
                :value="scope.row.due"
                @input="onPickerInput(scope.row, $event)"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </template>
          </el-table-column>
          <el-table-column prop="task" label="任务" width="360"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import "element-ui/lib/theme-chalk/index.css";
import { Scheduler } from "../../scheduler/Scheduler";
import { Schedule } from "../../entity/Schedule";
const { ipcRenderer, remote, shell } = require("electron");
const scheduler = remote.getGlobal("scheduler") as Scheduler;

import moment from "moment";

import { Button, Table, TableColumn, Input, DatePicker } from "element-ui";
import { rowCallbackParams } from "element-ui/types/table";

interface Section {
  title: string,
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
    [DatePicker.name]: DatePicker,
  },
  filters: {
    formatDate(d: Date) {
      return moment(d).format("YYYY-MM-DD");
    }
  },
  data() {
    return {
      schedule_filter: "",
      schedules: [] as Schedule[],
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker: DatePicker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker: DatePicker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick(picker: DatePicker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },
    };
  },
  computed: {
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
        schedules_Today = schedules_Today.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1)
        schedules_Tomorrow = schedules_Tomorrow.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1)
        schedules_TheDayAfterTomorrow = schedules_TheDayAfterTomorrow.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1)
        schedules_InPast3Days = schedules_InPast3Days.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1)
        schedules_MoreThan3DaysAgo = schedules_MoreThan3DaysAgo.filter(s => decodeURI(s.task).toLowerCase().indexOf(this.schedule_filter.toLowerCase()) > -1)
      }

      return [{
        title: 'Today',
        background: '#f0ffff',
        schedules: schedules_Today
      },
      {
        title: 'Tomorrow',
        background: '#f2f2f2',
        schedules: schedules_Tomorrow
      },
      {
        title: 'Upcomming',
        background: '#f2f2f2',
        schedules: schedules_TheDayAfterTomorrow
      },
      {
        title: 'Past 3 days',
        background: '#f2f2f2',
        schedules: schedules_InPast3Days
      },
      {
        title: 'Due past but unattended',
        background: '#f2f2f2',
        schedules: schedules_MoreThan3DaysAgo
      }
      ];
    }
  },
  async mounted() {
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        if (this.schedule_filter) {
          this.schedule_filter = "";
        } else {
          ipcRenderer.send("schedules-escape");
        }
      }
    }, true);
    const schedules = await scheduler.list();
    this.schedules = schedules;
    console.log("schedules", schedules);
  },
  methods: {
    tableRowClassName(row: rowCallbackParams) {
      const section = row.row as Section;
      if (row.rowIndex === 1) {
        return "warning-row";
      } else if (row.rowIndex === 3) {
        return "success-row";
      }
      return "";
    },
    onPickerInput(schedule: Schedule, event: Date) {
      schedule.due = event;
      this.schedules.splice(this.schedules.findIndex(s => s.id === schedule.id), 1, schedule);
      scheduler.update_due(schedule);
    }
  }
});
</script>

<style lang="scss">
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>
