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
interface DatePredicate {
    weekday(): boolean;
}
interface Date {
    addDays(h: number): Date;
    addHours(h: number): Date;
    addMinutes(m: number): Date;
    addSeconds(s: number): Date;
    addMilliseconds(s: number): Date;
    next():DateIntermediate;
    is(): DatePredicate;
}

interface DateConstructor {
    parse(s: string): Date;
    today(): Date;
}


interface Date {
    yyyymmddhhmmss(): string;
}

Date.prototype.yyyymmddhhmmss = function () {
    const yyyy = this.getFullYear();
    const mm = this.getMonth() < 9 ? '0' + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
    const dd = this.getDate() < 10 ? '0' + this.getDate() : this.getDate();
    const hh = this.getHours() < 10 ? '0' + this.getHours() : this.getHours();
    const min = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes();
    const ss = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
    return ''.concat(yyyy + '').concat(mm + '').concat(dd + '').concat(hh + '').concat(min + '').concat(ss + '');
};
