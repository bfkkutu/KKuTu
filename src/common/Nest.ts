import { Session, SessionData } from "express-session";

import { Schema } from "common/Schema";
import { AuthModuleConfig } from "back/utils/LoginRoute";

export namespace Nest {
  export namespace Page {
    export type Type = keyof Page.DataTable;
    export type DataTable = {
      Portal: {};
      Login: {
        loginMethods: AuthModuleConfig[];
      };
      Game: {
        wsUrl: string;
      };
    };
    export type Metadata = {
      titleArgs?: string[];
      ad?: Schema.Settings["advertisement"];
    };
    export interface Props<T extends Page.Type> {
      session: Session & Partial<SessionData>;
      locale: string;
      page: T;
      path: string;
      title: string;

      data: Page.DataTable[T];
      version: string;

      metadata?: Page.Metadata;
      ssr?: boolean;

      children: React.ReactNode;
    }
  }
  export type ClientSettings = Pick<Schema.Settings["application"], never> & {
    languageSupport: Table<string>;
  };
  export type ScheduleOptions = {
    /**
     * `true`인 경우 시작할 때 한 번 즉시 호출한다.
     */
    callAtStart: boolean;
    /**
     * `true`인 경우 정시에 호출된다. 가령 1시간마다 호출하려는 경우
     * 시작 시점과는 관계 없이 0시 정각, 1시 정각, …에 맞추어 호출된다.
     */
    punctual: boolean;
  };
}
