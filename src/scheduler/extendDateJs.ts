// tslint:disable-next-line: no-var-requires
require('datejs');

//see https://github.com/datejs/Datejs
interface Date {
    addHours(h: number): Date;
    addDays(h: number): Date;
}

interface DateConstructor {
    parse(s: string): Date;
    today(): Date;
}
