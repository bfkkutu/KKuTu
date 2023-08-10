import { Database } from "common/Database";

export namespace WebSocketMessage {
  export enum Type {
    /**
     * @sender Server.
     * @condition 채널 접속 시.
     *
     * 현재 채널의 유저 정보, 방 정보, 캐릭터 정보 등을 클라이언트에 제공한다.
     */
    Initialize = "initialize",

    Heartbeat = "heartbeat",
    Error = "error",
  }

  export namespace Content {
    /**
     * 서버가 보내는 메시지.
     */
    export interface Server {
      [Type.Initialize]: {};

      [Type.Heartbeat]: {};
      [Type.Error]: WebSocketError.Message[keyof WebSocketError.Content];
    }
    /**
     * 클라이언트가 보내는 메시지.
     */
    export interface Client {}
  }

  export type Server = {
    [type in keyof Content.Server]: { type: type } & Content.Server[type];
  };
  export type Client = {
    [type in keyof Content.Client]: { type: type } & Content.Client[type];
  };
}

export namespace WebSocketError {
  export enum Type {
    /**
     * @reason 게임 채널에 로그인하지 않은 채로 접속하려고 시도하면 발생한다.
     * @action 소켓을 닫는다.
     */
    Unauthorized = 401,
  }

  export interface Content {
    [Type.Unauthorized]: {};
  }

  // 오류는 서버만 보낸다.
  export type Message = {
    [type in keyof Content]: {
      errorType: type;
    } & Content[type];
  };
}
