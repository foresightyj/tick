import Schedule from "@/scheduler/Schedule";
import "@/scheduler/extendDateJs";

describe('Schedule', () => {
    it('tomorrow as parsed as tomorrow 9am', () => {
        const s = Schedule.parseCommand('tomorrow hello world');
        console.log(s);
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
        expect(s!.task).toEqual("hello world");
    });

    it('so is tmr', () => {
        const s = Schedule.parseCommand('tmr hello world');
        console.log(s);
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
        expect(s!.task).toEqual("hello world");
    });

    it('next friday is parsed as next friday 9am', () => {
        const s = Schedule.parseCommand('next friday hi there');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1).addHours(9));
        expect(s!.task).toEqual("hi there");
    });
});
