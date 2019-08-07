import assert from "assert";
import "./extendDateJs";
import { AssertionError } from 'assert';

export function get_now(): Date {
    const now = new Date();
    return now;
}

export function get_tonight() {
    const now = get_now();
    let tonight = new Date(now.toLocaleDateString());
    tonight.setHours(18); // 6pm tonight
    if (tonight < now) {
        // already evening, change to 1 hour later
        tonight = now;
        tonight.setHours(tonight.getHours() + 1);
    }
    return tonight;
}

export function get_tomorrow() {
    const tomorrow = new Date(new Date().toLocaleDateString());
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9); // 9am tomorrow morning
    return tomorrow;
}

export function getZeroAmOf(d: Date) {
    const c = new Date(d.getTime());
    c.setHours(0);
    c.setMinutes(0);
    c.setSeconds(0);
    c.setMilliseconds(0);
    return c;
}

export function round_off_to_next_working_hour(d: Date) {
    const zeroAm = getZeroAmOf(d);
    const diff = d.getTime() - zeroAm.getTime();
    const tooEarly = diff < 9 * 3600 * 1000; // earlier than 9am
    const tooLate = diff > 20 * 3600 * 1000; // later than 8pm
    if (tooEarly) {
        return zeroAm.addHours(9);
    } else if (tooLate) {
        return zeroAm.addDays(1).addHours(9);
    }
    return d;
}


export function parse_numeric_time(s: string) {
    assert(/^\d{3,4}$/.test(s), "oops, wrong numeric time: " + s);
    let parsed: Date;
    if (s.length === 3) {
        parsed = Date.parse(s.substr(0, 1) + ":" + s.substring(1));
    } else if (s.length === 4) {
        parsed = Date.parse(s.substr(0, 2) + ":" + s.substring(2));
    } else {
        throw new Error("impossible");
    }
    return parsed;
}