import React from "react";

import { WebSocketMessage } from "./common/WebSocket";

declare global {
  type Table<V> = {
    [key: string]: V;
  };
  interface Serializable<T> {
    /**
     * 정보를 클라이언트에서 다룰 수 있도록 가공해 반환한다.
     */
    serialize(): T;
  }
  type NumberRange = [begin: number, end: number];
  type HexColor = `#${string & { length: 6 }}`;

  declare function alert(content: React.ReactNode): Promise<void>;
  declare function prompt(
    title: string,
    content: React.ReactNode
  ): Promise<string | null>;
  declare function confirm(content: React.ReactNode): Promise<boolean>;

  interface Window {
    adsbygoogle: any;
    alert(content: React.ReactNode): Promise<void>;
    prompt(title: string, content: React.ReactNode): Promise<string | null>;
    confirm(content: React.ReactNode): Promise<boolean>;
  }
}
