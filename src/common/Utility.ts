/**
 * 대상 객체의 엔트리 일부만 갖는 객체를 반환한다.
 *
 * @param object 대상 객체.
 * @param keys 선택할 키.
 */
export function pick<T extends object, U extends keyof T>(
  object: T,
  ...keys: U[]
): Pick<T, U> {
  return keys.reduce((pv, v) => {
    if (v in object) pv[v] = object[v];
    return pv;
  }, {} as Pick<T, U>);
}
export function omit<T extends object, U extends keyof T>(
  object: T,
  ...keys: U[]
): Omit<T, U> {
  const R = { ...object };
  for (const key of keys) if (key in R) delete R[key];
  return R;
}
export function EnumKeyIterator(object: Table<string | number>) {
  return Object.keys(object).filter((key) => isNaN(Number(key)));
}
export function EnumValueIterator(object: Table<string | number>) {
  return Object.values(object).filter(
    (value) => !isNaN(Number(value))
  ) as number[];
}
/**
 * 배열을 생성해 반환한다.
 *
 * @param length 배열의 길이.
 * @param fill 배열의 내용.
 */
export function Iterator<T = undefined>(length: number, fill?: T): T[] {
  return Array(length).fill(fill);
}
/**
 * 배열을 주어진 함수에 따라 딕셔너리로 바꾸어 반환한다.
 *
 * @param target 대상 배열.
 * @param placer 값을 반환하는 함수.
 * @param keyPlacer 키를 반환하는 함수.
 */
export function reduceToTable<T, U, V extends number | string>(
  target: T[],
  placer: (v: T, i: number, my: T[]) => U,
  keyPlacer: (v: T, i: number, my: T[]) => V = (v) => String(v) as V
): { [key in V]: U } {
  return target.reduce((pv, v, i, my) => {
    pv[keyPlacer(v, i, my)] = placer(v, i, my);
    return pv;
  }, {} as { [key in V]: U });
}
export function sum(...arr: number[]): number;
export function sum(arr: number[]): number;
export function sum(arr: number | number[], ...args: number[]): number {
  if (typeof arr === "number") {
    let sum = arr;
    for (let i = 0; i < args.length; ++i) {
      sum += args[i];
    }
    return sum;
  }
  return sum(...arr);
}

