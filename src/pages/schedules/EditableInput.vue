<template>
  <span>
    <span
      class="editable-description"
      ref="editableDescription"
      :class="{'editable-disabled': disabled}"
      v-show="!isEditing"
      v-on:click.prevent="onClick"
      v-html="urlify(value) || '&nbsp;'"
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
  min-width: 100px;
  width: 100%;
}

.editable-disabled {
  text-decoration: line-through;
  color: lightgrey;
}
</style>

<script lang="ts">
import Vue from 'vue';
import { Prop } from "vue/types/options";
import { Input } from "element-ui";
const { shell } = require('electron');
import "./ClickOutside";
import assert from "assert";
import { urlReplacer } from "../../utils";

export default Vue.extend({
  components: {
    [Input.name]: Input,
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
    urlify(text: string) {
      return urlReplacer(text, url => {
        const replacement = decodeURI(url);
        return `<a href="${url}" title="Ctrl+click或者Alt+click在默认浏览器中打开">${replacement}</a>`
      });
    },
    onClick(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.ctrlKey || e.altKey) {
        if (target.tagName === 'A') {
          const t = target as HTMLAnchorElement;
          shell.openExternal(t.href)
        }
      } else if (!this.disabled) {
        this.isEditing = true;
      }
    },
    onUpdate(val: string) {
      this.copy = val;
      this.$emit("input", val);
    },
    onChange(val: string) {
      this.isEditing = false;
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
