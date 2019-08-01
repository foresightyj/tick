import assert from "assert";
import _ from "lodash";
import * as winston from "winston";
import PouchDB from "pouchdb";
import * as PouchDbFind from "pouchdb-find";
PouchDB.plugin(PouchDbFind);
import Schedule from "./Schedule";

const dbName = "schedules.db";
const db = new PouchDB(dbName);

export class Scheduler {
    private static readonly supported_events = ['initialized', 'scheduled',
        'schedule_due_time_passed', 'due', 'added', 'removed',
        'due_updated', 'task_updated', 'attended', 'recovered', 'error'
    ];
    private readonly _map: { [k: string]: NodeJS.Timeout } = {};
    private readonly _listeners: { [k: string]: Function[] } = {};

    private static assert_valid_event_name(event_name: string) {
        assert(Scheduler.supported_events.indexOf(event_name) > -1, event_name + ' is not supported. try: ' + Scheduler.supported_events.join(','))
    }

    private publish(event_name: string, ...args: any[]) {
        Scheduler.assert_valid_event_name(event_name);
        try {
            const listeners = this._listeners[event_name] || [];
            let args = Array.prototype.slice.call(arguments, 1);
            listeners.forEach(listener => listener.apply(null, args));
        } catch (ex) {
            winston.error(ex);
            winston.error(ex.stack);
            throw new Error("publish failed: " + ex.message);
        }
    }

    private timing_out(schedule: Schedule) {
        const now = new Date();
        if (schedule.due >= now) {
            const delta = schedule.delta;
            this._map[schedule._id] = setTimeout(() => {
                this.publish('due', schedule);
            }, delta * 1000);
            winston.info("scheduler has scheduled timeout in " + delta + " seconds");
            this.publish('scheduled', schedule);
        } else {
            winston.info("oops scheduler cannot timeout `" + schedule.task + "` as due time has passed: ");
            this.publish('schedule_due_time_passed', schedule, 'due time passed');
        }
    }

    private clear_timeout(schedule: Schedule) {
        assert(schedule, "schedule in clear_timeout");
        const timeout = this._map[schedule._id];
        clearTimeout(timeout);
        delete this._map[schedule._id];
    }

    private update_db(schedule: Schedule, success_cb: (schedule: Schedule) => void) {
        db.put(schedule)
            .then((doc: Schedule) => {
                success_cb(doc);
            })
            .catch((err: Error) => {
                this.publish('error', err);
                winston.error("put failed: " + err);
                winston.info(schedule);
            })
    }

    init() {
        this.list((err?: Error, schedules?: Schedule[]) => {
            winston.info("initial load of schedules:")
            if (err) {
                winston.error(err);
            }
            if (schedules) {
                winston.info(schedules);
                schedules.forEach(this.timing_out);
            }
            this.publish('initialized')
        })
    }
    on(event_name: string, cb: Function) {
        assert(event_name, "event_name")
        assert(cb, "cb")
        if (event_name.indexOf(',') !== -1) {
            let that = this
            const names = event_name.split(',').map(s => s.trim())
            names.forEach(function (n) {
                that.on(n, cb)
            })
            return
        }
        Scheduler.assert_valid_event_name(event_name)
        let listeners = this._listeners[event_name] = this._listeners[event_name] || []
        listeners.push(cb)
    }
    add(schedule: Schedule) {
        assert(schedule, "schedule is null in add")
        this.update_db(schedule, doc => {
            winston.info("scheduler added: `" + schedule.task + "`")
            this.publish("added", schedule)
            this.timing_out(schedule)
        })
    }
    attend(schedule: Schedule) {
        schedule.attended = true;
        this.update_db(schedule, doc => {
            winston.info("scheduler attended: `" + schedule.task + "`")
            this.publish('attended', schedule);
            this.clear_timeout(schedule);
        })
    }
    recover(schedule: Schedule) {
        schedule.attended = false
        this.update_db(schedule, doc => {
            winston.info("scheduler recovered `" + schedule.task + "`")
            this.publish('recovered', schedule)
            this.timing_out(schedule)
        })
    }
    update_due(schedule: Schedule) {
        assert(schedule, "schedule is null in update due")
        this.update_db(schedule, doc => {
            winston.info("scheduler update due: `" + schedule.task + "`")
            this.publish('due_updated', schedule)
            this.clear_timeout(schedule)
            this.timing_out(schedule)
        })
    }
    update_task(schedule: Schedule) {
        assert(schedule, "schedule is null in update task")
        this.update_db(schedule, doc => {
            winston.info("scheduler update task: `" + schedule.task + "`")
            this.publish('task_updated', schedule)
        })
    }
    remove(schedule: Schedule) {
        assert(schedule, "schedule is null in remove")
        db.remove(schedule).then(() => {
            winston.info("scheduler removed: `" + schedule.task + "`")
            this.publish('removed', schedule)
            this.clear_timeout(schedule)
        }).catch((err: Error) => {
            this.publish('error', err)
            winston.error("remove failed: " + err);
        })
    }
    list(cb: (error?: Error, schedules?: Schedule[]) => void) {
        assert(cb, "cb")
        var now = new Date()
        now.setDate(now.getDate() - 1)
        var yesterday_morning = new Date(now.toLocaleDateString())
        db.createIndex({
            index: {
                fields: ['due', 'attended']
            }
        }).then(() => {
            let recent_schedules = db.find({
                selector: {
                    'due': {
                        '$gte': yesterday_morning,
                        '$lt': '3000-01-01'
                    }
                },
                sort: ['due']
            });

            let past_unattended_schedules = db.find({
                selector: {
                    'due': {
                        '$lt': yesterday_morning,
                    },
                    'attended': {
                        '$ne': true
                    }
                }
            })

            let all_schedules = Promise.all([recent_schedules, past_unattended_schedules])
            all_schedules.then((res) => {
                let docs = _.concat(res[0].docs, res[1].docs)
                const schedules = docs.map(Schedule.fix);
                cb(undefined, schedules);
            }).catch((err: Error) => {
                this.publish('error', err);
                cb(new Error(`find failed: ${err}\r\n${err.stack}`));
            })
        }).catch((err: Error) => {
            this.publish('error', err);
            cb(new Error("create index failed: " + err + '\r\n' + err.stack));
        });
    }
    close(cb: () => void) {
        db.close().then(cb);
    }
}

export default new Scheduler();