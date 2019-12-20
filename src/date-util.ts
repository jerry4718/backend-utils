export namespace DateUtil {
    /** 始终保持将字符串转换为当地时区的日期对象 */
    export function parse(str: string): Date {
        if (!/^\d{4}-\d{2}-\d{2}(| \d{2}:\d{2}:\d{2}(| \+\d{4}))$/.test(str)) {
            throw Error(`cannot parse string: '${str}'`);
        }
        // 直接调用Date.parse()，会因为内容，导致不确定有没有加时区
        // 所以，这里将只有日期的情况设定为0点，并且设定为0时区
        if (str.length === 10) { // 'yyyy-MM-dd' 的情况长度为10
            str = str + " 00:00:00";
        }
        if (str.length === 19) { // 'yyyy-MM-dd HH:mm:ss' 的情况长度为19
            str = str + " +0000";
        }
        // 加上与0时区的时间差
        return new Date(Date.parse(str) + new Date().getTimezoneOffset() * 60 * 1000);
    }

    type flexKey = "date" | "month" | "year" | "hours" | "minutes" | "seconds" | "milliseconds";

    const fieldReflect: { [key in flexKey]: Function[] } = {
        date: [Date.prototype.setDate, Date.prototype.getDate],
        month: [Date.prototype.setMonth, Date.prototype.getMonth],
        year: [Date.prototype.setFullYear, Date.prototype.getFullYear],
        hours: [Date.prototype.setHours, Date.prototype.getHours],
        minutes: [Date.prototype.setMinutes, Date.prototype.getMinutes],
        seconds: [Date.prototype.setSeconds, Date.prototype.getSeconds],
        milliseconds: [Date.prototype.setMilliseconds, Date.prototype.getMilliseconds],
    };

    export function add(from: Date, cnt: number, field: flexKey = "date") {
        const temp = new Date(from.getTime());

        const [setter, getter] = fieldReflect[field];

        const val = getter.apply(temp);
        setter.apply(temp, [val + cnt]);

        return temp;
    }

    export function between(from: string | Date, to: string | Date = format(new Date(), masks.isoDate)) {
        from = typeof from === "string" ? parse(from) : parse(format(from, masks.isoDate));
        to = typeof to === "string" ? parse(to) : parse(format(to, masks.isoDate));

        const val = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
        return (val >= 0 ? 1 : -1) * Math.floor(Math.abs(val));
    }

    export function* each(from: string | Date, to: string | Date = format(new Date(), masks.isoDate)) {
        if (from instanceof Date) {
            from = format(from, masks.isoDate);
        }
        if (to instanceof Date) {
            to = format(to, masks.isoDate);
        }
        if (from.length !== 10 || to.length !== 10) {
            throw Error(`cannot match param ${from} or ${to}`);
        }
        let fromDate = parse(from);
        const toDate = parse(to);
        // console.log(format(from), format(to));
        fromDate = new Date(fromDate.getTime());
        while (between(fromDate, toDate) >= 0) {
            yield fromDate;
            fromDate = add(fromDate, 1, "date");
        }
    }

    // Internationalization strings
    const i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    // Some common format strings
    type maskKey = "default" | "timestamp" | "shortDate" | "mediumDate" | "longDate" | "fullDate" | "shortTime"
        | "mediumTime" | "longTime" | "isoDate" | "isoTime" | "isoDateTime" | "isoUtcDateTime";
    export const masks: { [key in maskKey]: string } = {
        default: "yyyy-MM-dd HH:mm:ss",
        timestamp: "yyyyMMddHHmmss",
        shortDate: "M/d/yy",
        mediumDate: "MMM d, yyyy",
        longDate: "MMMM d, yyyy",
        fullDate: "dddd, MMMM d, yyyy",
        shortTime: "h:mm TT",
        mediumTime: "h:mm:ss TT",
        longTime: "h:mm:ss TT Z",
        isoDate: "yyyy-MM-dd",
        isoTime: "HH:mm:ss",
        isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
        isoUtcDateTime: "UTC:yyyy-MM-dd'T'HH:mm:ss'Z'",
    };

    const regToken = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g;

    export function format(date: Date = new Date(), mask: maskKey | string = "default", utc = false) {
        mask = String(masks[mask] || mask || masks.default);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) === "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        const d = (utc ? Date.prototype.getUTCDate : Date.prototype.getDate).apply(date),
            D = (utc ? Date.prototype.getUTCDay : Date.prototype.getDay).apply(date),
            M = (utc ? Date.prototype.getUTCMonth : Date.prototype.getMonth).apply(date),
            y = (utc ? Date.prototype.getUTCFullYear : Date.prototype.getFullYear).apply(date),
            H = (utc ? Date.prototype.getUTCHours : Date.prototype.getHours).apply(date),
            m = (utc ? Date.prototype.getUTCMinutes : Date.prototype.getMinutes).apply(date),
            s = (utc ? Date.prototype.getUTCSeconds : Date.prototype.getSeconds).apply(date),
            L = (utc ? Date.prototype.getUTCMilliseconds : Date.prototype.getMilliseconds).apply(date),
            o = utc ? 0 : date.getTimezoneOffset();

        const flags: { [key in string]: any } = {
            d: d,
            dd: pad(d),
            ddd: i18n.dayNames[D],
            dddd: i18n.dayNames[D + 7],
            M: M + 1,
            MM: pad(M + 1),
            MMM: i18n.monthNames[M],
            MMMM: i18n.monthNames[M + 12],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            m: m,
            mm: pad(m),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: H < 12 ? "a" : "p",
            tt: H < 12 ? "am" : "pm",
            T: H < 12 ? "A" : "P",
            TT: H < 12 ? "AM" : "PM",
            Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10 ? 1 : 0) * d % 10]
        };

        return mask.replace(regToken, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    }

    function pad(value: any, length?: number) {

        if (!length) length = 2;

        value = String(value);
        while (value.length < length) {
            value = "0" + value;
        }

        return value;
    }
}
