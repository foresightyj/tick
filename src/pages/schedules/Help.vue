<template>
  <el-popover placement="right" width="400" trigger="hover">
    <div>
      <section>
        <h5>全局快捷键</h5>
        <ul>
          <li>ctrl+s: 打开命令窗口</li>
        </ul>
      </section>
      <section>
        <h5>命令窗口快捷键</h5>
        <ul>
          <li>ctrl+l: 打开列表窗口</li>
        </ul>
      </section>
      <section>
        <h5>列表窗口快捷键</h5>
        <ul>
          <li>alt+1, alt+2, ...: 切换到列表窗口的第n个Tab</li>
          <li>alt+9: 切换到列表窗口的第后一个Tab</li>
        </ul>
      </section>
      <section>
        <h5>创建任务 (例子)</h5>
        <ul>
          <li>100s buy stuff in 100 seconds</li>
          <li>10m buy stuff in 10 minutes</li>
          <li>2h buy stuff in 2 hours</li>
          <li>tonight buy stuff</li>
          <li>tmr buy stuff</li>
          <li>tomorrow buy stuff (same as above)</li>
          <li>next week buy stuff</li>
          <li>tmr 9am buy stuff</li>
          <li>tmr 5pm buy stuff</li>
          <li>tmr 1700 buy stuff (same as above)</li>
          <li>next friday buy stuff</li>
          <li>
            支持所有
            <a href="https://github.com/datejs/Datejs#parsing">datejs</a>的时间格式
          </li>
        </ul>
      </section>
      <section>
        <h5>其他命令</h5>
        <ul>
          <li>list: 在命令窗口的时候,也可以使用快捷键ctrl+l</li>
          <li>quit/exit</li>
          <li>reboot/restart</li>
        </ul>
      </section>
    </div>
    <el-button type="text" slot="reference" icon="el-icon-question">帮助</el-button>
  </el-popover>
</template>


<script lang="ts">
import Vue from 'vue'
import { Button, Popover } from "element-ui";
const { shell } = require('electron');
export default Vue.extend({
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
  },
  methods: {
    onClick: function (e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.ctrlKey || e.altKey) {
        if (target.tagName === 'A') {
          const t = target as HTMLAnchorElement;
          shell.openExternal(t.href)
        }
      }
    },
  }
})
</script>
