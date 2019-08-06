import assert from "assert";
import { Schedule } from '../entity/Schedule';
import _ from "lodash";
import "./extendDateJs";

import { get_tomorrow, get_tonight } from "./time_utils";

const timeUnitMap: { [k: string]: number } = { s: 1, m: 60, h: 3600, d: 3600 * 24, w: 3600 * 24 * 7 };

export default function parseSchedule(rawCommand: string): Schedule | undefined {
    // first, my home-made solution
    let match = null;
    /*see https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character*/
    const splits = rawCommand.split(/\s+(.+)/);
    const firstToken = splits[0];
    const task = splits[1];

    if (/tonight/i.test(firstToken)) {
        return Schedule.create(get_tonight(), task);
    }

    match = firstToken.match(/^(\d+)([smhdw])$/);
    if (match) {
        const delta = parseInt(match[1], 10) * timeUnitMap[match[2]];
        assert(_.isNumber(delta), "delta is not a number");
        const due = new Date();
        due.setSeconds(due.getSeconds() + delta);
        return Schedule.create(due, task);
    }

    match = firstToken.match(/^\d{4}$/);
    if (match) {
        const h = parseInt(match[0].substring(0, 2), 10);
        const m = parseInt(match[0].substring(2, 4), 10);
        const now = new Date();
        const due = new Date();
        due.setHours(h);
        if (due < now) {
            due.setDate(due.getDate() + 1);
        }
        due.setMinutes(m);
        due.setSeconds(0);
        due.setMilliseconds(0);
        return Schedule.create(due, task);
    }

    // then, the ultimate solution via datejs
    const spacePatt = /\s+/g;
    const MAX_ROUND = 5;
    let result = null;
    let validIndex = 0;
    let round = 0;
    let timeParsed = null;

    const tmrPatt = /\btmr\b/i;
    // tslint:disable-next-line: no-conditional-assignment
    while ((result = spacePatt.exec(rawCommand)) && round < MAX_ROUND) {
        round++;
        let segment = rawCommand.substring(0, result.index);
        if (tmrPatt.test(segment)) {
            segment = segment.replace(tmrPatt, 'tomorrow');
        }
        const tp = Date.parse(segment);
        if (tp) {
            validIndex = result.index;
            timeParsed = tp;
        }
    }
    const timeSegment = rawCommand.substring(0, validIndex).trim();
    const taskSegment = rawCommand.substring(validIndex).trim();

    // console.log("time parsed: " + time_parsed, ', time_segment:', time_segment);
    if (timeParsed) {
        if (timeParsed.getHours() === 0 && timeParsed.getMinutes() === 0 && timeParsed.getSeconds() === 0) {
            // exactly at 0am which is not reasonable for our app
            // so we adjust it to 9am as long as time_segment doesn't contain any digits
            if (!/\d/.test(timeSegment)) {
                // datejs gives tomorrow 0am but that is not very useful in our case,
                // so we give it tomorrow 9am
                timeParsed = timeParsed.addHours(9);
            }
        }
        return Schedule.create(timeParsed, taskSegment);
    }
    throw new Error("failed to parse: " + rawCommand);
}
