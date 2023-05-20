import FS from "fs";
import Path from "path";

import { Schema } from "../../common/Schema";

/**
 * 프로젝트 루트 경로.
 */
export const PROJECT_ROOT = Path.resolve(__dirname, "..");
/**
 * 개발 플래그 설정 여부.
 */
export const DEVELOPMENT = process.argv.includes("--dev");
/**
 * `data/endpoints.json` 파일 객체.
 */
export const ENDPOINTS: Table<any> = {};
/**
 * `data/settings.json` 파일 객체.
 */
export const SETTINGS: Schema.Settings = Object.assign(
  {},
  JSON.parse(getProjectData("settings.json").toString()),
  DEVELOPMENT ? JSON.parse(getProjectData("settings.dev.json").toString()) : {}
);
/**
 * `package.json` 파일 객체.
 */
export const PACKAGE: Table<any> = JSON.parse(
  getProjectData("../package.json").toString()
);

/**
 * 프로젝트 데이터 폴더의 데이터를 동기식으로 읽어 그 내용을 반환한다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로.
 */
export function getProjectData(path: string): Buffer {
  return FS.readFileSync(Path.resolve(__dirname, `../data/${path}`));
}
/**
 * 프로젝트 데이터 폴더의 파일에 비동기식으로 내용을 쓴다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로.
 * @param data 파일에 쓸 내용.
 */
export function setProjectData(path: string, data: any): Promise<void> {
  return new Promise((res, rej) => {
    FS.writeFile(Path.resolve(__dirname, `../data/${path}`), data, (err) => {
      if (err) {
        rej(err);
        return;
      }
      res();
    });
  });
}
/**
 * 프로젝트 루트로부터 하위 경로를 구해 반환한다.
 *
 * @param path 하위 경로 배열.
 */
export function resolve(...path: string[]): string {
  return Path.resolve(PROJECT_ROOT, ...path);
}
