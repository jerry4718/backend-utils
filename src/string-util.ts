export namespace StringUtil {
    export function fullLeft(str: string, len = 3, char = "0") {
        if (str.length < len) {
            str = char + str;
        }
        return str;
    }

    export function fullRight(str: string, len = 3, char = "0") {
        if (str.length < len) {
            str = str + char;
        }
        return str;
    }

    export function equalIgnoreCase(str1: string, str2: string) {
        return String(str1).toLowerCase() === String(str2).toLowerCase();
    }
}
