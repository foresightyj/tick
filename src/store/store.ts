import Vue from "vue";
import Vuex from "vuex";
import * as A from "./actions";
import * as M from './mutations';

Vue.use(Vuex);
import { Schedule } from "../entity/Schedule";

export interface IStoreState {
    schedules: Schedule[]
}

export default new Vuex.Store({
    state: {
        schedules: [],
    },
    mutations: {
        [M.DELETE_SCHEDULE_MUTATION](state: IStoreState, schedule: Schedule) {
        }
    },
    actions: {
        async [M.DELETE_SCHEDULE_MUTATION]({ dispatch, commit }, schedule: Schedule) {
            commit(A.DELETE_SCHEDULE_ACTION, schedule);
        },
    },
});
