import { DateUnit } from "../enums/DateUnit";
import Express from "express";

/**
 * 클라이언트 설정 객체.
 */
export const CLIENT_SETTINGS =
  "FRONT" in Object && eval("window.__CLIENT_SETTINGS");
/**
 * 프론트엔드 여부.
 */
export const FRONT: boolean = Boolean(CLIENT_SETTINGS);
/**
 * 유효한 단일 샤프 인자의 집합.
 */
export const REGEXP_LANGUAGE_ARGS = /\{#(\d+?)\}/g;
/**
 * 시간대 오프셋 값(㎳).
 */
export const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * DateUnit.MINUTE;
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
  keyPlacer?: (v: T, i: number, my: T[]) => V
): { [key in V]: U } {
  return target.reduce(
    keyPlacer
      ? (pv, v, i, my) => {
          pv[keyPlacer(v, i, my)] = placer(v, i, my);
          return pv;
        }
      : (pv, v, i, my) => {
          pv[String(v) as V] = placer(v, i, my);
          return pv;
        },
    {} as { [key in V]: U }
  );
}
/**
 * 문자열 내 단일 샤프 인자들을 추가 정보로 대체시켜 반환한다.
 *
 * @param text 입력 문자열.
 * @param args 추가 정보.
 */
export function resolveLanguageArguments(text: string, ...args: any[]): string {
  return text.replace(REGEXP_LANGUAGE_ARGS, (_, v1) => args[v1]);
}
export function send404(_: Express.Request, res: Express.Response): void {
  res.sendStatus(404);
}
