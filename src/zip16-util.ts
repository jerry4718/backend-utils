export namespace Zip16Util {
    // 可以修改zip字符串，zip字符串要求长度是64位，不重复的字符串，超出64位的部分不会影响编码结果
    const zip = "!*(-_).0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const hex = "0123456789abcdef";
    //
    const separator = "~";

    function full(str: string, length: number) {
        while (str.length < length) {
            str = "0" + str;
        }
        return str;
    }

    const des6: string[] = [];
    for (let a = 0; a < 64; a++) {
        des6.push(full(a.toString(2), 6));
    }

    const des4: string[] = [];
    for (let a = 0; a < 16; a++) {
        des4.push(full(a.toString(2), 4));
    }

    function binary(str: string, des: string[], dict: string) {
        return str.split("")
            .map(c => des[dict.indexOf(c)])
            .join("")
            .replace(/^0*/, "");
    }

    function source(bin: string, len: number, des: string[], dict: string) {
        let position = bin.length;
        const temp = [];
        while (position > 0) {
            temp.push(full(bin.slice(Math.max(position - len, 0), position), len));
            position = position - len;
        }
        return temp.reverse()
            .map(b => dict[des.indexOf(b)])
            .join("");
    }

    /**
     * 对0~f进制的字符串按照进制转换规则执行编码
     */
    export function encode(str: string) {
        const bin = binary(str, des4, hex);
        return [
            source(bin, 6, des6, zip),
            source(str.length.toString(2), 6, des6, zip)
        ].join(separator);
    }

    /**
     * 对压缩结果执行解码
     */
    export function decode(str: string) {
        const [dist, sign] = str.split(separator);
        const bin = binary(dist, des6, zip);
        const len = binary(sign, des6, zip);
        return full(
            source(bin, 4, des4, hex),
            parseInt(len, 2)
        );
    }
}
