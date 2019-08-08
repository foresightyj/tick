import parseSchedule from "@/scheduler/parseSchedule";
import "@/scheduler/extendDateJs";

describe('Schedule', () => {
    it("09:00 is same as 9am, 09am", () => {
        const a = Date.parse("09:00");
        const b = Date.parse("9am");
        const c = Date.parse("09am");
        const d = Date.parse("9:00");
        const e = Date.parse("09:00am");
        expect(a).toEqual(b);
        expect(a).toEqual(c);
        expect(a).toEqual(d);
        expect(a).toEqual(e);
    });

    it("17:40 is same as 5:40pm", () => {
        const a = Date.parse("17:40");
        const b = Date.parse("5:40pm");
        const c = Date.parse("05:40pm");
        const d = Date.parse("17:40pm");
        expect(a).toEqual(b);
        expect(a).toEqual(c);
        expect(a).toEqual(d);
    });

    it("datejs bug when parsing `tomorrow 1430`", () => {
        const a = Date.parse("tomorrow");
        const b = Date.parse("tomorrow 1430");
        expect(a).toEqual(b.addDays(1))
    })

    it("10s", () => {
        const now = new Date();
        const s = parseSchedule('10s hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(new Date(now.getTime()).addSeconds(10));
    })

    it("2h", () => {
        const now = new Date();
        const s = parseSchedule('2h hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(new Date(now.getTime()).addHours(2));
    })

    it("3d", () => {
        const now = new Date();
        const s = parseSchedule('3d hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(new Date(now.getTime()).addDays(3));
    })

    it('tomorrow as tmr 9am', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow haha', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("haha");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
    });

    it('so is tmr', () => {
        const now = new Date();
        const s = parseSchedule('tmr buy apple', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy apple");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
    });

    it('tomorrow 2:40pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 2:40pm hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(40));
    });

    it('next friday as next friday 9am', () => {
        const now = new Date();
        const s = parseSchedule('next friday hi there', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hi there");
        expect(s!.due).toEqual(Date.today().next().friday().addHours(9));
    });

    it('tomorrow 1430 is parsed as tomorrow 2:30pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 1430 hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(30));
    });
    it('tomorrow 14:30 is parsed as tomorrow 2:30pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 14:30 hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(30));
    });
    it('tomorrow 2:30pm is parsed as tomorrow 2:30pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 2:30pm hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(30));
    });
    it('tomorrow 14:30pm is parsed as tomorrow 2:30pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 14:30pm hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(30));
    });
    it('tomorrow 5pm', () => {
        const now = new Date();
        const s = parseSchedule('tomorrow 5pm hello world', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("hello world");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(17));
    });

    it('next friday buy grocery', () => {
        const now = new Date();
        const s = parseSchedule('next friday buy grocery', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy grocery");
        expect(s!.due).toEqual(Date.today().next().friday().addHours(9));
    });
    it('next friday 5pm buy grocery', () => {
        const now = new Date();
        const s = parseSchedule('next friday 5pm buy grocery', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy grocery");
        expect(s!.due).toEqual(Date.today().next().friday().addHours(17));
    });

    it('next friday 5pm buy grocery', () => {
        const now = new Date();
        const s = parseSchedule('next friday 5pm buy grocery', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy grocery");
        expect(s!.due).toEqual(Date.today().next().friday().addHours(17));
    });

    it('5pm buy grocery with now @ 8am will be parsed at today 5pm', () => {
        const now = Date.today();
        now.addHours(8);
        const s = parseSchedule('5pm buy grocery', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy grocery");
        expect(s!.due).toEqual(Date.today().addHours(17));
    });

    it('5pm buy grocery with now @ 6pm will be parsed as tmr 5pm', () => {
        const now = Date.today();
        now.addHours(18);
        const s = parseSchedule('5pm buy grocery', now);
        expect(s).toBeTruthy();
        expect(s!.task).toEqual("buy grocery");
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(17));
    });

});
