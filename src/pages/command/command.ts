import Vue from 'vue';
import Command from './Command.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Command),
}).$mount('#app');
