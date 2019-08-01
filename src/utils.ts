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
