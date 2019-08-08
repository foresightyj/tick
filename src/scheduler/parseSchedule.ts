import assert from "assert";
import { Schedule } from '../entity/Schedule';
import _ from "lodash";
import "./extendDateJs";

import { parse_numeric_time, get_tomorrow, get_tonight, round_off_to_next_working_hour } from "./time_utils";

const timeUnitMap: { [k: string]: number } = { s: 1, m: 60, h: 3600, d: 3600 * 24, w: 3600 * 24 * 7 };

interface IScheduleParseResult {
    timeParsed: Date,
    timeSegment: string,
    taskSegment: string,
}

export default function parseSchedule(rawCommand: string, now: Date): Schedule | undefined {
    // first, my home-made solution
    let match = null;
    /*see https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character*/
    const splits = rawCommand.split(/\s+(.+)/);
    const firstToken = splits[0];
    const task = splits[1];

    if (/tonight/i.test(firstToken)) {
        return Schedule.create(get_tonight(now), task);
    }

    match = firstToken.match(/^(\d+)([smhdw])$/);
    if (match) {
        const delta = parseInt(match[1], 10) * timeUnitMap[match[2]];
        assert(_.isNumber(delta), "delta is not a number");
        const due = new Date(now.getTime());
        due.addSeconds(delta);
        return Schedule.create(due, task);
    }

    match = firstToken.match(/^\d{4}$/);
    if (match) {
        const h = parseInt(match[0].substring(0, 2), 10);
        const m = parseInt(match[0].substring(2, 4), 10);
        const due = new Date(now.getTime());
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
    let round = 0;
    const tmrPatt = /\btmr\b/i;
    const allParsed: IScheduleParseResult[] = [];
    while ((result = spacePatt.exec(rawCommand)) && round < MAX_ROUND) {
        round++;
        let segment = rawCommand.substring(0, result.index);
        if (tmrPatt.test(segment)) {
            segment = segment.replace(tmrPatt, 'tomorrow');
        }
        const tp = Date.parse(segment);
        if (!tp) break;
        const validIndex = result.index;
        const taskSegment = rawCommand.substring(validIndex).trim();
        allParsed.push({
            timeParsed: tp,
            timeSegment: segment.trim(),
            taskSegment: taskSegment.trim(),
        });
    }
    if (!allParsed.length) throw new Error("failed to parse: " + rawCommand);

    //datejs failed to parse `tmr 1430` as `tmr`.
    let lastParsed = allParsed[allParsed.length - 1];

    // fix tomorrow 1430 parsed incorrectly
    if (allParsed.length > 1) {
        const secondLast = allParsed[allParsed.length - 2];
        const diff = lastParsed.timeSegment.substr(secondLast.timeSegment.length).trim().toLowerCase();
        assert(diff.length > 0, 'diff is falsy');
        if (/^\d{3,4}$/.test(diff)) {
            const parsed = parse_numeric_time(diff);
            lastParsed.timeParsed = secondLast.timeParsed;
            lastParsed.timeParsed.setHours(parsed.getHours());
            lastParsed.timeParsed.setMinutes(parsed.getMinutes());
            lastParsed.timeParsed.setSeconds(parsed.getSeconds());
        }
    }

    //fix `next friday 5am buy stuff` as `next friday` and `5am buy stuff`
    const tokens = lastParsed.taskSegment.split(/(?<=^\S+)\s/) //courtesy, split on first whitespace
    if (tokens.length === 2) {
        const firstToken = tokens[0];
        if (/^\d{3,4}$/.test(firstToken)) { //hopefully 1430
            const parsed = parse_numeric_time(firstToken);
            lastParsed.timeParsed.setHours(parsed.getHours());
            lastParsed.timeParsed.setMinutes(parsed.getMinutes());
            lastParsed.timeParsed.setSeconds(parsed.getSeconds());
            lastParsed.taskSegment = tokens[1];
        } else {
            const parsed = Date.parse(firstToken); //hopefully 8am or 2:30pm
            if (parsed && parsed.getTime() > Date.today().getTime() && parsed.getTime() < Date.today().addDays(1).getTime()) {
                lastParsed.timeParsed.setHours(parsed.getHours());
                lastParsed.timeParsed.setMinutes(parsed.getMinutes());
                lastParsed.timeParsed.setSeconds(parsed.getSeconds());
                lastParsed.taskSegment = tokens[1];
            }
        }
    }

    let timeParsed = lastParsed.timeParsed;
    if (timeParsed.getHours() === 0 && timeParsed.getMinutes() === 0 && timeParsed.getSeconds() === 0) {
        timeParsed = round_off_to_next_working_hour(timeParsed);
    }
    if(timeParsed < now){
        timeParsed = timeParsed.addDays(1);
    }
    return Schedule.create(timeParsed, lastParsed.taskSegment);
}
