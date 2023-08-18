import React from "react";

import { WebSocketMessage } from "./common/WebSocket";

declare global {
  type Table<V> = {
    [key: string]: V;
  };
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
  interface WebSocket {
    on: WebSocket["addEventListener"];
    off: WebSocket["removeEventListener"];
    _send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    send<T extends WebSocketMessage.Type>(
      type: T,
      content: WebSocketMessage.Content.Client[T]
    ): void;
    wait(type: WebSocketMessage.Type, callback: () => void): void;
  }
}
