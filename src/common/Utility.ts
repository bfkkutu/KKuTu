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
