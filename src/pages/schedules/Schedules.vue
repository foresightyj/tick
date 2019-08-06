<template>
  <div>
    <el-input v-model="schedule_filter" placeholder="Search..." autofocus></el-input>
    <el-table :data="schedules" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column label="期限" width="180">
        <template slot-scope="scope">
          {{scope.row.due | formatDate}}
          <!-- <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>-->
        </template>
      </el-table-column>
      <el-table-column prop="task" label="任务" width="180"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Button, Table, TableColumn, Input } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { Scheduler } from "../../scheduler/Scheduler";
import { Schedule } from "../../entity/Schedule";
const { ipcRenderer, remote, shell } = require("electron");
const scheduler = remote.getGlobal("scheduler") as Scheduler;

import moment from "moment";

import { rowCallbackParams } from "element-ui/types/table";

export default Vue.extend({
  name: "app",
  components: {
    [Button.name]: Button,
    [Input.name]: Input,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  filters: {
    formatDate(d: Date) {
      return moment(d).format("YYYY-MM-DD");
    }
  },
  data() {
    return {
      schedule_filter: "",
      schedules: [] as Schedule[]
    };
  },
  computed: {
    sections: function () {
      let startOfToday = moment().startOf('day').toDate()
      let startOf3DaysAgo = moment().subtract(3, 'days').startOf('day').toDate()
      let startOfTomorrow = moment().add(1, 'days').startOf('day').toDate()
      let startOfTheDayAfterTomorrow = moment().add(1, 'days').startOf('day').toDate()

      let schedules_Today = this.schedules.filter(s => s.due >= startOfToday && s.due < startOfTomorrow)
      let schedules_Tomorrow = this.schedules.filter(s => s.due >= startOfTomorrow && s.due < startOfTheDayAfterTomorrow)
      let schedules_TheDayAfterTomorrow = this.schedules.filter(s => s.due >= startOfTheDayAfterTomorrow)
      let schedules_InPast3Days = this.schedules.filter(s => s.due >= startOf3DaysAgo && s.due < startOfToday)
      let schedules_MoreThan3DaysAgo = this.schedules.filter(s => s.due < startOf3DaysAgo)

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
      ]
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
      if (row.rowIndex === 1) {
        return "warning-row";
      } else if (row.rowIndex === 3) {
        return "success-row";
      }
      return "";
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
