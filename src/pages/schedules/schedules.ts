import Vue from 'vue';
import Schedules from './Schedules.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Schedules),
}).$mount('#app');
