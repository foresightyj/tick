import assert from "assert";
import Vue from "vue";
import Vuex from "vuex";
import * as A from "./actions";
import * as M from './mutations';
import { Scheduler } from "../scheduler/Scheduler";

const { remote } = require("electron");
const scheduler = remote.getGlobal("scheduler") as Scheduler;
assert(scheduler, "scheduler is falsy");

import { Schedule } from "../entity/Schedule";
import { inherits } from 'util';

export interface IStoreState {
    schedules: Schedule[]
}

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        schedules: [],
    },
    mutations: {
        [M.DELETE_SCHEDULE_MUTATION](state: IStoreState, schedule: Schedule) {
        }
    },
    actions: {
        async init() {
            const schedules = await scheduler.list();
        },
        async [M.DELETE_SCHEDULE_MUTATION]({ dispatch, commit }, schedule: Schedule) {
            commit(A.DELETE_SCHEDULE_ACTION, schedule);
        },
    },
});
