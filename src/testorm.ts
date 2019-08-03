import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "./entity/User";
import { Schedule } from "./entity/Schedule";

import ScheduleRepository from "./repositories/ScheduleRepository";

import conn from "./repositories/dbConnection";
import parseSchedule from './scheduler/parseSchedule';

//see https://github.com/typeorm/typeorm/issues/3152
(async () => {
    // const connectionOptions = await getConnectionOptions();
    // console.log('connectionOptions', connectionOptions);
    try {
        const connection = await conn;
        const scheduleRepository = connection.getCustomRepository(ScheduleRepository);
        const p = parseSchedule("tmr buy apple");
        console.log('parsed', p);
        const schedule = await scheduleRepository.save(p!);
        const s = await scheduleRepository.findScheduleById(schedule.id);
        console.log('schedule from db', s);
    } catch (err) {
        console.error("OOPS", err);
    }
})();
