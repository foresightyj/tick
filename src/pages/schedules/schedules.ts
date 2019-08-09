import Vue from 'vue';
import Schedules from './Schedules.vue';
import store from "../../store/store";

Vue.config.productionTip = false;

new Vue({
    store,
    render: (h) => h(Schedules),
}).$mount('#app');
