import { camelCase } from 'lodash';

type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

type Camelize<T> = T extends readonly any[]
  ? Camelize<T[number]>[]
  : T extends object
    ? {
        [K in keyof T as CamelCase<string & K>]: Camelize<T[K]>;
      }
    : T;

export function keysToCamel<T>(obj: T): Camelize<T> {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as Camelize<T>;
  } else if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[camelCase(key)] = keysToCamel(value);
    }
    return result as Camelize<T>;
  } else {
    return obj as Camelize<T>;
  }
}
