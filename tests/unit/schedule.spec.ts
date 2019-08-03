import parseSchedule from "@/scheduler/parseSchedule";
import "@/scheduler/extendDateJs";

describe('Schedule', () => {
    it('tomorrow is parsed as tomorrow 9am', () => {
        const s = parseSchedule('tomorrow hello world');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
        expect(s!.task).toEqual("hello world");
    });

    it('so is tmr', () => {
        const s = parseSchedule('tmr buy apple');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
        expect(s!.task).toEqual("buy apple");
    });

    // it('tomorrow 1430 is parsed as tomorrow 2:30pm', () => {
    //     const s = parseSchedule('tomorrow 1430 hello world');
    //     expect(s).toBeTruthy();
    //     expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(30));
    //     expect(s!.task).toEqual("hello world");
    // });

    it('tomorrow 2:40pm is parsed as tomorrow 2:40pm', () => {
        const s = parseSchedule('tomorrow 2:40pm hello world');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(14).addMinutes(40));
        expect(s!.task).toEqual("hello world");
    });

    it('next friday is parsed as next friday 9am', () => {
        const s = parseSchedule('next friday hi there');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().next().friday().addHours(9));
        expect(s!.task).toEqual("hi there");
    });
});
