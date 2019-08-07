import assert from "assert";
import _ from "lodash";
import * as winston from "winston";

import { Schedule } from "../entity/Schedule";
import connMaker from "../repositories/dbConnection";
import ScheduleRepository from "../repositories/ScheduleRepository";

import EventEmitter from 'events';

export class Scheduler extends EventEmitter {
    private static readonly supported_events = ['initialized', 'scheduled',
        'schedule_due_time_passed', 'due', 'added', 'removed',
        'due_updated', 'task_updated', 'completed', 'recovered', 'error',
    ];
    private readonly _timerMap: { [k: string]: NodeJS.Timer } = {};

    private readonly _conn = connMaker();
    private readonly _scheduleRepo = this._conn.then(c => c.getCustomRepository(ScheduleRepository))

    private start_tick(this: Scheduler, schedule: Schedule) {
        const now = new Date();
        if (schedule.due >= now) {
            const deltaSeconds = schedule.delta;
            if (deltaSeconds > 7 * 24 * 3600) {
                winston.info("due time is greater than 7 days, skip ticking");
                return;
            }
            this._timerMap[schedule.id] = setTimeout(() => {
                this.emit('due', schedule);
            }, deltaSeconds * 1000);
            winston.info("scheduler has scheduled timeout in " + deltaSeconds + " seconds");
            this.emit('scheduled', schedule);
        } else {
            winston.info("oops scheduler cannot timeout `" + schedule.task + "` as due time has passed: ");
            this.emit('schedule_due_time_passed', schedule, 'due time passed');
        }
    }

    private clear_timeout(schedule: Schedule) {
        assert(schedule, "schedule in clear_timeout");
        const timeout = this._timerMap[schedule.id];
        clearTimeout(timeout);
        delete this._timerMap[schedule.id];
    }

    private async update_db(schedule: Schedule): Promise<Schedule> {
        assert(schedule, "schedule is falsy")
        const repo = (await this._scheduleRepo);
        const s = await repo.findOneOrFail(schedule.id);
        s.task = schedule.task;
        s.due = schedule.due;
        s.completed = schedule.completed;
        await repo.save(s);
        return s;
    }

    public async init() {
        try {
            winston.info("initial load of schedules:");
            const schedules = await this.list();
            winston.info(schedules);
            schedules.forEach(s => this.start_tick(s));
        } catch (err) {
            winston.warn('Initialization Error');
            winston.error(err)
            console.log('Initialization error', err);
        }
    }
    public async add(schedule: Schedule): Promise<Schedule> {
        const repo = await this._scheduleRepo;
        await repo.insert(schedule);
        assert(schedule.id, "schedule.id must be non-zero after insertion");
        console.log('added', schedule);
        this.emit('added', schedule);
        this.start_tick(schedule);
        console.log('after added', schedule);
        return schedule;
    }
    public async complete(schedule: Schedule): Promise<Schedule> {
        schedule.completed = true;
        const s = await this.update_db(schedule);
        winston.info("scheduler completed: `" + s.task + "`");
        this.emit('completed', s)
        this.clear_timeout(s);
        return s;
    }
    public async recover(schedule: Schedule): Promise<Schedule> {
        schedule.completed = false;
        const s = await this.update_db(schedule);
        winston.info("scheduler recovered `" + s.task + "`");
        this.emit('recovered', s);
        this.start_tick(s);
        return s;
    }
    public async update_due(schedule: Schedule): Promise<Schedule> {
        assert(schedule, "schedule is null in update due");
        const s = await this.update_db(schedule);
        winston.info("scheduler update due: `" + s.task + "`");
        this.emit('due_updated', s);
        this.clear_timeout(s);
        this.start_tick(s);
        return s;
    }
    public async update_task(schedule: Schedule): Promise<Schedule> {
        assert(schedule, "schedule is null in update task");
        const s = await this.update_db(schedule);
        winston.info("scheduler update task: `" + s.task + "`");
        this.emit('task_updated', s);
        return s;
    }
    public async remove(schedule: Schedule) {
        assert(schedule, "schedule is null in remove");
        try {
            (await this._scheduleRepo).delete(schedule.id);
            this.clear_timeout(schedule);
            this.emit('removed', schedule);
            winston.info("scheduler removed: `" + schedule.task + "`");
        } catch (err) {
            this.emit('error', err);
            winston.error("remove failed: " + err);
        }
    }
    public async list(): Promise<Schedule[]> {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        const yesterday_morning = new Date(now.toLocaleDateString());

        const repo = await this._scheduleRepo;
        try {
            const recentSchedules = await repo.createQueryBuilder("schedule")
                .where("DATE(schedule.due) >= :yesterday", { yesterday: yesterday_morning })
                .orderBy("schedule.due")
                .getMany();

            const pastUncompletedSchedules = await repo.createQueryBuilder("schedule")
                .where("NOT schedule.uncompleted")
                .where("DATE(schedule.due) < :yesterday", { yesterday: yesterday_morning })
                .orderBy("schedule.due")
                .getMany();
            return recentSchedules.concat(pastUncompletedSchedules);
        } catch (err) {
            this.emit('error', err);
            winston.error(err);
            return [];
        }
    }
    public async close() {
        (await this._conn).close();
    }
}

export default new Scheduler();
