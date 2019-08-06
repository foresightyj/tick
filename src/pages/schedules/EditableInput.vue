<template>
  <span>
    <span
      class="editable-description"
      ref="taskDescription"
      :class="{'editable-disabled': disabled}"
      v-show="!isEditing"
      v-on:click.prevent="onClick"
      v-html="urlify(value)"
      v-bind:title="value"
    ></span>
    <el-input
      v-if="isEditing"
      v-click-outside="onClickOutside"
      size="mini"
      :disabled="disabled"
      :value="copy"
      placeholder="请输入任务描述"
      @input="onUpdate"
      @change="onChange"
    ></el-input>
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
</style>

<script lang="ts">
import Vue from 'vue';
import { Prop } from "vue/types/options";
import { Input } from "element-ui";
const ClickOutside = require('vue-click-outside');
const { shell } = require('electron');

export default Vue.extend({
  components: {
    [Input.name]: Input,
  },
  //   directives: { ClickOutside },
  directives: {
    'click-outside': {
      bind: function (el: any, binding: any, vnode: any) {
        const exp = binding.expression;
        const handler = vnode.context[exp];
        if (typeof handler !== 'function') {
          throw new Error("v-click-outside only accepts a function argument but was passed: " + exp);
        }
        el.__vueClickOutsideHandler__ = function (event: any) {
          if (!(el == event.target || el.contains(event.target))) {
            handler.call(el, event);
          }
        };
        document.addEventListener('click', el.__vueClickOutsideHandler__)
      },
      unbind: function (el: any) {
        document.removeEventListener('click', el.__vueClickOutsideHandler__);
      },
    }
  },
  props: {
    value: {
      required: true,
      type: String as Prop<string>
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
    }
  },
  methods: {
    onClick: function (e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.ctrlKey || e.altKey) {
        if (target.tagName === 'A') {
          const t = target as HTMLAnchorElement;
          console.log("clicked :" + t.href)
          shell.openExternal(t.href)
        }
      } else {
        this.isEditing = true
      }
    },
    onUpdate(val: string) {
      this.copy = val;
      this.$emit("input", val);
    },
    onChange(val: string) {
      this.isEditing = false;
    },
    urlify: function (text: string) {
      var urlRegex = /(https?:\/\/[^\s]+)/g
      var html = text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" title="Ctrl+click to open in default browser">' + decodeURI(url) + '</a>'
      })
      return html;
    },
    onClickOutside: function (e: MouseEvent) {
      if (e.target !== this.$refs.taskDescription) {
        this.isEditing = false;
      }
    }
  }
})
</script>
