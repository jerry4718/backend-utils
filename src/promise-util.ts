import { VarUtil } from "./var-util";

export namespace PromiseUtil {

    export function promising(from: any, name: string): (<T>(...args: any[]) => Promise<T>) {
        const fn = (arguments.length === 2 && VarUtil.isFunction(from)) ? from : from[name];
        return function (...args: any[]) {
            return new Promise(function (resolve, reject) {
                fn.apply(from, [...args, function (err: Error, data: any) {
                    if (err) return reject(err);
                    resolve(data);
                }]);
            });
        };
    }

    /**
     * 多个任务依次执行（顺序同步，无迸发）
     */
    export async function series<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
        const results: T[] = [];
        const copy = [...tasks];

        while (copy.length) {
            const task = copy.shift();
            const result = await task();
            results.push(result);
        }

        return results;
    }

    /**
     * 在多个worker中同步执行任务，多worker之间为迸发，单worker内为同步
     * 可以保证证某个任务一定在前一个任务开始后才开始（但是不保证某个任务一定在前一个任务结束后才开始）
     */
    export async function queue<T>(count: number, tasks: (() => Promise<T>)[]): Promise<T[]> {
        const results: T[] = [];

        const copy = [...tasks];

        const units: any[] = [];
        while (units.length < count) units.push(void 0);

        const len = tasks.length;
        await Promise.all(units.map(async () => {
            while (copy.length) {
                const idx = len - copy.length;
                const task = copy.shift();
                results[idx] = await task();
            }
        }));

        return results;
    }
}
