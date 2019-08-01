import assert from "assert";
import _ from "lodash";
import "./extendDateJs";

export default class Schedule {
    public _id: string;
    public readonly due: Date;
    public readonly task: any;
    public attended: boolean;
    constructor(id: string | undefined, due: Date, task: any) {
        this._id = id || new Date().toISOString(); //created time as Id and will never change
        assert(due, "due is falsy");
        assert(task, "task is falsy");
        this.due = due;
        this.task = task;
        this.attended = false;
    }

    get delta() {
        return (this.due.getTime() - new Date().getTime()) / 1000;
    }
    public static fix(schedule: Schedule):Schedule {
        assert(schedule.due, "schedule.due");
        // assert(schedule.due.indexOf('T') > -1, "T must be found in schedule.due before fix")
        // schedule.due = new Date(schedule.due)
        return schedule;
    }

    private static get_tonight() {
        const now = new Date();
        let tonight = new Date(now.toLocaleDateString());
        tonight.setHours(18); //6pm tonight
        if (tonight < now) {
            // already evening, change to 1 hour later
            tonight = now;
            tonight.setHours(tonight.getHours() + 1);
        }
        return tonight;
    }

    private static get_tomorrow() {
        const tomorrow = new Date(new Date().toLocaleDateString());
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9); //9am tomorrow morning
        return tomorrow;
    };

    private static timeUnitMap: { [k: string]: number } = { 's': 1, 'm': 60, 'h': 3600, 'd': 3600 * 24, w: 3600 * 24 * 7 };
    public static parseCommand(raw_command: string): Schedule | undefined {
        // first, my home made solution
        let match = null;
        /*see https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character*/
        const splits = raw_command.split(/\s+(.+)/);
        let firstToken = splits[0];
        const task = splits[1];

        if (/tonight/i.test(firstToken)) {
            return new Schedule(undefined, Schedule.get_tonight(), task);
        }

        match = firstToken.match(/^(\d+)([smhdw])$/);
        if (match) {
            const delta = parseInt(match[1]) * Schedule.timeUnitMap[match[2]];
            assert(_.isNumber(delta), "delta is not a number");
            const due = new Date();
            due.setSeconds(due.getSeconds() + delta);
            return new Schedule(undefined, due, task);
        }

        match = firstToken.match(/^\d{4}$/);
        if (match) {
            const h = parseInt(match[0].substring(0, 2));
            const m = parseInt(match[0].substring(2, 4));
            const now = new Date();
            const due = new Date();
            due.setHours(h);
            if (due < now) {
                due.setDate(due.getDate() + 1);
            }
            due.setMinutes(m);
            due.setSeconds(0);
            due.setMilliseconds(0);
            return new Schedule(undefined, due, task);
        }

        // then, the ultimate solution via datejs

        const space_patt = /\s+/g;
        let result = null,
            valid_index = 0,
            round = 0,
            MAX_ROUND = 5,
            time_parsed = null;

        let tmr_patt = /\btmr\b/i;
        while ((result = space_patt.exec(raw_command)) && round < MAX_ROUND) {
            round++;
            let segment = raw_command.substring(0, result.index);
            if (tmr_patt.test(segment)) {
                segment = segment.replace(tmr_patt, 'tomorrow');
            }
            let _time_parsed = Date.parse(segment);
            if (_time_parsed) {
                valid_index = result.index;
                time_parsed = _time_parsed;
            }
        }
        const time_segment = raw_command.substring(0, valid_index).trim();
        const task_segment = raw_command.substring(valid_index).trim();

        console.log("time parsed: " + time_parsed);
        if (time_parsed) {
            if (time_parsed.getHours() === 0 && time_parsed.getMinutes() === 0 && time_parsed.getSeconds() === 0) {
                // exactly at 0am which is not reasonable for our app
                // so we adjust it to 9am as long as time_segment doesn't contain any digits
                if (!/\d/.test(time_segment)) {
                    // datejs gives tomorrow 0am but that is not very useful in our case,
                    // so we give it tomorrow 9am
                    time_parsed = time_parsed.addHours(9);
                }
            }
            return new Schedule(undefined, time_parsed, task_segment);
        }
    };

}

