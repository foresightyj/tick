import Schedule from "@/scheduler/Schedule";
import "@/scheduler/extendDateJs";

describe('Schedule', () => {
    it('tomorrow', () => {
        const s = Schedule.parseCommand('tomorrow hello world');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1));
        expect(s!.task).toEqual("hello world");
    });
    it('next friday', () => {
        const s = Schedule.parseCommand('next friday hi there');
        expect(s).toBeTruthy();
        expect(s!.due).toEqual(Date.today().addDays(1));
        expect(s!.task).toEqual("hi there");
    });
});
