import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "./entity/User";
import { Schedule } from "./entity/Schedule";

import ScheduleRepository from "./repositories/ScheduleRepository";

import connMaker from "./repositories/dbConnection";
import parseSchedule from './scheduler/parseSchedule';

//see https://github.com/typeorm/typeorm/issues/3152
(async () => {
    try {
        const connection = await connMaker();
        const scheduleRepository = connection.getCustomRepository(ScheduleRepository);
        const p = parseSchedule("tmr buy apple");
        const schedule = await scheduleRepository.save(p!);
        const s = await scheduleRepository.findOne(schedule.id);
        console.log('schedule from db', s);
    } catch (err) {
        console.error("OOPS", err);
    }
})();
