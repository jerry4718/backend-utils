import { DateUtil } from "./date-util";
import { StringUtil } from "./string-util";

export namespace GenUtil {
    export function serial(prefix = "No.") {
        const timestamp = DateUtil.format(new Date(), DateUtil.masks.timestamp); // 拼接时间戳
        const ran = StringUtil.fullLeft(Math.floor(Math.random() * 1000).toString()); // 1000以内的随机数
        return [
            prefix, // 前缀
            timestamp,
            StringUtil.fullLeft(ran, 3, "0"),
        ].join("");
    }
}
