<template>
  <span>
    <strong
      class="editable-description"
      ref="editableDescription"
      v-on:click.prevent="onClick"
      v-show="!isEditing"
    >{{value | formatDate}}</strong>
    <el-date-picker
      v-if="isEditing"
      v-click-outside="onClickOutside"
      size="mini"
      :disabled="disabled"
      :value="value"
      @input="onInput"
      class="editable-time"
      type="datetime"
      placeholder="选择日期时间"
      align="right"
      :picker-options="pickerOptions"
    ></el-date-picker>
  </span>
</template>

<style lang="scss">
.editable-description {
  display: inline-block;
  width: 100%;
}

.editable-disabled {
  text-decoration: line-through;
  color: grey;
}

.editable-time {
  width: 150%;
}
</style>

<script lang="ts">
import Vue from 'vue';
import assert from "assert";
import { Prop } from "vue/types/options";
import { DatePicker, Message } from "element-ui";
import { Input } from "element-ui";
const { shell } = require('electron');
import "./ClickOutside";
import moment from "moment";

moment.locale("zh-CN");
export default Vue.extend({
  components: {
    [Input.name]: Input,
    [DatePicker.name]: DatePicker,
  },
  props: {
    value: {
      required: true,
      type: Date as Prop<Date>
    },
    disabled: {
      required: false,
      type: Boolean as Prop<boolean>
    }
  },
  data() {
    return {
      copy: this.value,
      isEditing: false,
      pickerOptions: {
        shortcuts: [
          {
            text: '1小时后',
            onClick(picker: DatePicker) {
              const now = new Date();
              const hourLater = now.addHours(1);
              picker.$emit('pick', hourLater);
            }
          },
          {
            text: '明天',
            onClick(picker: DatePicker) {
              const now = new Date();
              const tmr = now.addDays(1);
              if (!tmr.is().weekday()) {
                Message.warning("明天是周末哦~~")
              }
              picker.$emit('pick', tmr);
            }
          },
          {
            text: '一周以后',
            onClick(picker: DatePicker) {
              const now = new Date();
              const nextWeek = now.addDays(7);
              picker.$emit('pick', nextWeek);
            }
          }
        ]
      },
    }
  },
  filters: {
    formatDate(d: Date) {
      return moment(d).fromNow();
    }
  },
  methods: {
    onInput(val: Date) {
      this.$emit("input", val);
    },
    onClick() {
      this.isEditing = true;
    },
    onClickOutside: function (e: MouseEvent) {
      const descEl = this.$refs.editableDescription;
      assert(descEl, "descEl is falsy");
      if (e.target !== descEl) {
        this.isEditing = false;
      }
    }
  }
})
</script>
