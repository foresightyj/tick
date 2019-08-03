<template>
  <input ref="input" type="text" class="command" v-model="value" />
</template>

<script lang="ts">
import Vue from "vue";
import { ipcRenderer } from "electron";
import assert from "assert";

export default Vue.extend({
  name: "app",
  data() {
    return {
      value: ""
    };
  },
  computed: {
    input(): HTMLInputElement {
      const i = this.$refs.input as HTMLInputElement;
      assert(i, "input not found");
      return i;
    }
  },
  mounted() {
    this.input.focus();
    window.addEventListener(
      "keyup",
      e => {
        /* code, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code */
        if (e.code === "Escape") {
          ipcRenderer.send("command-escape");
        } else if (e.code === "KeyL" && e.altKey) {
          ipcRenderer.send("command-list");
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            this.value = ""; //hack to remove special characters by mac's option+l
          }, 20);
        } else if (e.code === "Enter") {
          ipcRenderer.send("command-enter", this.value);
          this.value = "";
        }
      },
      true
    );
  }
});
</script>

<style lang="scss">
body {
  overflow-y: hidden;
}
.command {
  height: 40px;
  width: 380px;
  text-indent: 10px;
  &:focus {
    outline-width: 0;
  }
}
</style>
