<template>
  <span>
    <span
      ref="taskDescription"
      v-show="!isEditing"
      v-on:click.prevent="onClick"
      v-html="urlify(value)"
      v-bind:title="value"
    ></span>
    <el-input
      v-if="isEditing"
      v-click-outside="onClickOutside"
      size="mini"
      :value="copy"
      placeholder="请输入任务描述"
      @input="onTaskChanged(scope.row, $event)"
    ></el-input>
  </span>
</template>


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
        console.log('bind clickoutside', el);
        const exp = binding.expression;
        const handler = vnode.context[exp];
        if (typeof handler !== 'function') {
          throw new Error("v-click-outside only accepts a function argument but was passed: " + exp);
        }
        el.__vueClickOutsideHandler__ = function (event: any) {
          console.log("handling outside", event.target, el);
          if (!(el == event.target || el.contains(event.target))) {
            handler.call(el, event);
          }
        };
        document.addEventListener('click', el.__vueClickOutsideHandler__)
      },
      unbind: function (el: any) {
        console.log('unbind clickoutside', el);
        document.removeEventListener('click', el.__vueClickOutsideHandler__);
      },
    }
  },
  props: {
    value: {
      required: true,
      type: String as Prop<string>
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
      console.log('clicked');
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
    onUpdate: function () {
      this.isEditing = false;
      var val = this.copy;
      if (val) {
        this.$emit("input", val);
      }
    },
    urlify: function (text: string) {
      var urlRegex = /(https?:\/\/[^\s]+)/g
      var html = text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" title="Ctrl+click to open in default browser">' + decodeURI(url) + '</a>'
      })
      return html;
    },
    onClickOutside: function (e: MouseEvent) {
      console.log('clickoutside', e, this.$refs.taskDescription);
      if (e.target !== this.$refs.taskDescription) {
        if (this.isEditing) {
          this.isEditing = false
        }
      }
    }
  }
})
</script>
