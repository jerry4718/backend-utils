export namespace NumberUtil {
    export function fmt_Rp(num: number) {
        if (num && !isNaN(num)) {
            return String(num).replace(/(?=(?!^)(?:\d{3})+(?:\.|$))(\d{3}(\.\d+$)?)/g, ",$1")
                .replace(/[.,]/g, t => t === "," ? "." : ",");
        }
        return num;
    }
    export function parse_Rp(str: string) {
        if (str) {
            const rpz = str.replace(/[.,]/g, t => t === "," ? "." : "");
            if (/^\d*(\.\d*)?$/.test(rpz)) {
                return Number(rpz);
            }
        }
        return str;
    }
}
