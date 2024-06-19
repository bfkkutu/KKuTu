export namespace Chat {
  export enum Type {
    Chat = "chat",
    Notice = "notice",
  }
  export interface Chat {
    type: Chat.Type.Chat;
    sender: string;
    /**
     * 서버에서는 sender의 식별자만 전송하지만
     * sender가 게임을 종료한 이후 채팅을 랜더링할 때
     * 서버에 쿼리하지 않기 위해 별명도 기록한다.
     */
    nickname: string;
    content: string;
    visible: boolean;
    receivedAt: Date;
  }
  export interface Notice {
    type: Chat.Type.Notice;
    content: string;
    receivedAt: Date;
  }
  export type Item = Chat.Chat | Chat.Notice;
}
