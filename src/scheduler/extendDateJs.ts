// tslint:disable-next-line: no-var-requires
require('datejs');

//see https://github.com/datejs/Datejs

interface DateIntermediate{
    monday():Date;
    tuesday():Date;
    wednesday():Date;
    thursday():Date;
    friday():Date;
    saturday():Date;
    sunday():Date;

    //see https://github.com/datejs/Datejs/blob/a72399570889031d19f5fbc23095f840a32db968/src/globalization/en-US.js
    january():Date;
    february():Date;
    march():Date;
    april():Date;
    may():Date;
    june():Date;
    july():Date;
    august():Date;
    september():Date;
    october():Date;
    november():Date;
    december():Date;
    
}
interface Date {
    addHours(h: number): Date;
    addMinutes(m: number): Date;
    addSeconds(s: number): Date;
    addDays(h: number): Date;
    next():DateIntermediate;
}

interface DateConstructor {
    parse(s: string): Date;
    today(): Date;
}
