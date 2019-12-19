import { VarUtil } from "./var-util";

export namespace MathUtil {
    export function randomNumBoth(min: number, max: number) {
        const range = max - min;
        const rand = Math.random();
        return min + Math.round(rand * range);
    }

    // 自己实现toFixed
    export function toFixed(num: number, n: number) {
        const sign = num < 0 ? -1 : 1;
        const s = String(Math.pow(10, n) * Math.abs(num) + 0.5);
        return sign * parseInt(s, 10) / Math.pow(10, n);
    }

    type nos = number | string;

    // 计算小数位数
    export function decimalPlaces(num: nos) {
        return String(num).replace(/^(\+|-|)\d*(.|)/, "").length;
    }

    // 两个浮点数求和
    export function add(num1: nos, num2: nos) {
        const r1 = decimalPlaces(num1);
        const r2 = decimalPlaces(num2);
        const m = Math.pow(10, Math.max(r1, r2));
        // console.log(r1, r2, m);
        return Math.round(Number(num1) * m + Number(num2) * m) / m;
    }

    // 两个浮点数相减
    export function sub(num1: nos, num2: nos) {
        const r1 = decimalPlaces(num1);
        const r2 = decimalPlaces(num2);
        const n = Math.max(r1, r2);
        const m = Math.pow(10, n);
        return toFixed((Math.round(Number(num1) * m - Number(num2) * m) / m), n);
    }

    // 两个浮点数相乘
    export function mul(num1: nos, num2: nos) {
        const m = decimalPlaces(num1) + decimalPlaces(num2);
        return Number(String(num1).replace(".", "")) *
            Number(String(num2).replace(".", "")) /
            Math.pow(10, m);
    }

    // 两个浮点数相除
    export function div(num1: nos, num2: nos) {
        const t1 = decimalPlaces(num1);
        const t2 = decimalPlaces(num2);
        const r1 = Number(String(num1).replace(".", ""));
        const r2 = Number(String(num2).replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }

    // @ts-ignore
    type ctk = ctk[] | string | number | "+" | "-" | "*" | "/";

    /**
     * 模拟clojure的方式计算
     * 调用方式 calc(['+', 1, 2, 3, 4, ['*', 2, 3]])
     */
    export function calc(condition: ctk[]) {
        if (condition.length < 3) {
            throw Error(`${condition} is not valid`);
        }

        const result: ctk[] = condition.map(exp => VarUtil.isArray(exp) ? calc(exp) : exp);

        const operator = result.shift();
        const operate = getOperateFn(operator);

        // console.log(JSON.stringify([operator, ...result]));
        // console.log();

        while (result.length > 1) {
            result.splice(0, 2, operate.apply(void 0, result.slice(0, 2)));
        }

        return Number(result[0]);
    }

    function getOperateFn(operator: string) {
        switch (operator) {
            case "+":
                return MathUtil.add;
            case "-":
                return MathUtil.sub;
            case "*":
                return MathUtil.mul;
            case "/":
                return MathUtil.div;
            default:
                throw Error(`${operator} is not an operator`);
        }
    }

    /**
     * 四则运算表达式求值 支持括号，+,-,*,/，但使用字符串时不支持负数
     * 传入数组时，可以通过多级数组控制计算优先级
     * 但是更推荐使用calc （可以省略重复的运算符）
     */
    export function exp(condition: ctk[]) {
        let expression;
        try {
            if (Array.isArray(condition)) {
                expression = condition.join(" ");
                condition = condition.map(eyt => Array.isArray(eyt) ? exp(eyt) : eyt);
                // console.log(exp);
                return Number(evalRpn(stack2Rpn(condition)));
            } else {
                expression = condition;
                return Number(evalRpn(dal2Rpn(condition)));
            }
        } catch (e) {
            e.message = `${e.message} by exp:{${expression}}`;
            throw e;
        }
    }

    function expand(input: ctk[]) {
        const result = [].concat(input);
        const splice = Array.prototype.splice;
        for (let idx = 0; idx < result.length;) {
            const itm = result[idx];
            if (!Array.isArray(itm)) {
                idx++;
                continue;
            }
            itm.unshift("(");
            itm.push(")");
            splice.apply(result, [idx, 1].concat(itm));
        }
        return result;
    }

    function getPriority(value: string) {
        switch (value) {
            case "+":
            case "-":
                return 1;
            case "*":
            case "/":
                return 2;
            default:
                return 0;
        }
    }

    function priority(o1: string, o2: string) {
        return getPriority(o1) <= getPriority(o2);
    }

    function dal2Rpn(exp: string) {
        return stack2Rpn(exp.match(/(\d+\.\d+|\d+)|[\+\-\*\/\(\)]/g));
    }

    const operateToken = ["+", "-", "*", "/", "(", ")"];

    function stack2Rpn(inputStack: ctk[]) {
        let cur;
        const outputStack = [];
        const outputQueue = [];

        // console.log('step one');
        while (inputStack.length > 0) {
            cur = String(inputStack.shift());
            if (!operateToken.includes(cur)) {
                outputQueue.push(cur);
                continue;
            }
            if (cur === "(") {
                outputStack.push(cur);
                continue;
            }
            if (cur === ")") {
                let po = outputStack.pop();
                while (po !== "(" && outputStack.length > 0) {
                    outputQueue.push(po);
                    po = outputStack.pop();
                }
                if (po !== "(") {
                    throw Error("error: unmatched ()");
                }
                continue;
            }
            while (priority(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0) {
                outputQueue.push(outputStack.pop());
            }
            outputStack.push(cur);
        }
        // console.log('step two');
        if (outputStack.length > 0) {
            const finalToken = outputStack[outputStack.length - 1];
            if (finalToken === ")" || finalToken === "(") {
                throw Error("error: unmatched ()");
            }
            while (outputStack.length > 0) {
                outputQueue.push(outputStack.pop());
            }
        }
        // console.log('step three');
        return outputQueue;
    }

    function getResult(fir: nos, sec: nos, cur: nos) {
        let result;
        switch (cur) {
            case "+":
                result = MathUtil.add(fir, sec); break;
            case "-":
                result = MathUtil.sub(fir, sec); break;
            case "*":
                result = MathUtil.mul(fir, sec); break;
            case "/":
                result = MathUtil.div(fir, sec); break;
            default:
                throw Error("invalid expression");
        }
        // console.log(`${fir} ${cur} ${sec} = ${result}`);
        return result;
    }

    function evalRpn(rpnQueue: string[]) {
        const outputStack = [];
        // console.log(rpnQueue);
        while (rpnQueue.length > 0) {
            const cur = rpnQueue.shift();

            if (!operateToken.includes(cur)) {
                outputStack.push(cur);
                continue;
            }

            if (outputStack.length < 2) {
                throw Error("invalid stack length");
            }

            const sec = String(outputStack.pop());
            const fir = String(outputStack.pop());

            outputStack.push(getResult(fir, sec, cur));
        }

        if (outputStack.length !== 1) {
            throw Error("invalid expression");
        } else {
            return outputStack[0];
        }
    }
}
