import { VarUtil } from "./var-util";

export namespace ObjectUtil {

    /** 为obj添加一个可记忆属性（只有第一次取值时，才会根据getter取值） */
    export function reserveField<T>(obj: any, field: string, getter: () => T) {
        Object.defineProperty(obj, field, {
            get: reserveGetter(getter),
        });
    }

    /** 第一次调用以后，始终返回相同的值 */
    export function reserveGetter<T>(val: () => T): () => T {
        let lazied = false;
        let lazyVal: T;
        return function () {
            if (!lazied) {
                lazied = true;
                lazyVal = val();
            }
            return lazyVal;
        };
    }

    type IConstructor = NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor;
    /** 直接当做一个对象来处理 */
    export function reserveObject<T>(getter: () => T, _constructor: IConstructor): T {
        // @ts-ignore
        class ReserveObject<T> extends _constructor {
            private readonly getter: () => T;
            constructor(getter: () => T) {
                super();
                this.getter = reserveGetter(() => _constructor(getter()));
            }
            toPrimitive() { return this.getter(); }
            valueOf() { return this.getter(); }
            toString() {return String(this.getter()); }
        }

        // @ts-ignore
        return new ReserveObject(getter);
    }

    export function* arrayIterator<T>(arg: T[]) {
        for (const item of (arg as T[])) {
            yield item;
        }
    }

    export function* objectIterator<T>(arg: T) {
        for (const key of <(keyof T)[]>(Object.keys(arg).sort())) {
            yield {key, value: arg[key]};
        }
    }

    export function* createIterator(arg: any) {
        if (VarUtil.isArray(arg)) {
            for (const item of arg) {
                yield item;
            }
        } else if (VarUtil.isObject(arg)) {
            for (const key of Object.keys(arg).sort()) {
                yield {key, value: arg[key]};
            }
        } else {
            yield arg;
        }
    }
}
