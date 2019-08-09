<template>
  <span>
    <strong
      class="editable-description"
      ref="editableDescription"
      :class="{'editable-disabled': disabled}"
      v-on:click.prevent="onClick"
      v-show="!isEditing"
      :title="friendlyLongTime"
    >
      <i :class="iconClass"></i>
      {{value | formatDate}}
    </strong>
    <el-date-picker
      ref="datePicker"
      v-if="isEditing"
      v-click-outside="onClickOutside"
      size="mini"
      :disabled="disabled"
      :value="value"
      @input="onInput"
      @change="onChange"
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
  color: lightgrey;
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
import moment, { min } from "moment";
import { get_tonight, get_tomorrow } from "../../scheduler/time_utils";
import { DatePickerType } from 'element-ui/types/date-picker';
import { setTimeout } from 'timers';

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
    iconClass: {
      required: true,
      type: String as Prop<string>
    },
    disabled: {
      required: false,
      type: Boolean as Prop<boolean>
    }
  },
  data() {
    const minutesLater = [5, 10, 20, 30].map(m => (
      {
        text: `${m}分钟后`,
        onClick(picker: DatePicker) {
          const now = new Date();
          const minuteLater = now.addMinutes(m);
          picker.$emit('pick', minuteLater);
        }
      }
    ));

    const hoursLater = [1, 3, 6].map(h => (
      {
        text: `${h}小时后`,
        onClick(picker: DatePicker) {
          const now = new Date();
          const hourLater = now.addHours(h);
          picker.$emit('pick', hourLater);
        }
      }
    ));
    return {
      copy: this.value,
      isEditing: false,
      pickerOptions: {
        shortcuts: [
          ...minutesLater,
          ...hoursLater,
          {
            text: '今晚',
            onClick(picker: DatePicker) {
              const tonight = get_tonight(new Date());
              picker.$emit('pick', tonight);
            }
          },
          {
            text: '明天',
            onClick(picker: DatePicker) {
              const tmr = get_tomorrow(new Date());
              if (!tmr.is().weekday()) {
                Message.warning("明天是周末哦~~")
              }
              picker.$emit('pick', tmr);
            }
          },
          {
            text: '下周一',
            onClick(picker: DatePicker) {
              const nextMonday = Date.today().next().monday().addHours(9);
              picker.$emit('pick', nextMonday);
            }
          },
          {
            text: '一周之后',
            onClick(picker: DatePicker) {
              const now = new Date();
              let nextWeek = now.addDays(7);
              if (!nextWeek.is().weekday()) {
                nextWeek = nextWeek.addDays(2);
              }
              picker.$emit('pick', nextWeek);
            }
          },
          {
            text: '一月之后',
            onClick(picker: DatePicker) {
              const now = new Date();
              let nextMonth = now.addDays(30);
              if (!nextMonth.is().weekday()) {
                nextMonth = nextMonth.addDays(2);
              }
              picker.$emit('pick', nextMonth);
            }
          },
        ]
      },
    }
  },
  computed: {
    friendlyLongTime(): string {
      return moment(this.value).format("LLLL");
    },
    datePicker(): DatePicker {
      const datePicker = this.$refs.datePicker;
      assert(datePicker, "datePicker is falsy");
      return datePicker as DatePicker;
    }
  },
  filters: {
    formatDate(d: Date) {
      return moment(d).fromNow();
    }
  },
  methods: {
    onInput(val: Date): void {
      this.$emit("input", val);
    },
    onChange(val: Date): void {
      this.onInput(val);
      this.isEditing = false;
    },
    onClick(): void {
      const vm = this;
      if (!vm.disabled) {
        vm.isEditing = true;
        //nextTick is may be too quick.
        // setTimeout(() => {
        //   try {
        //     vm.datePicker.focus();
        //   } catch (err) {
        //     //internally el-input may not has its actual input element ready yet.
        //     console.log('error:', err);
        //   }
        // }, 20);
      }
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
