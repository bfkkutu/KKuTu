export namespace Chat {
  export enum Type {
    Chat = "chat",
    Notice = "notice",
  }
  export interface Chat {
    type: Chat.Type.Chat;
    /**
     * 서버와 통신할 때 이 Chat 객체를
     * 지정해야 하는 경우 사용한다.
     */
    id: string;
    sender: string;
    /**
     * 서버에서는 sender의 식별자만 전송하지만
     * sender가 게임을 종료한 이후 채팅을 랜더링할 때
     * 서버에 쿼리하지 않기 위해 별명도 기록한다.
     */
    nickname: string;
    content: string;
    visible: boolean;
    createdAt: Date;
  }
  export interface Notice {
    type: Chat.Type.Notice;
    content: string;
    createdAt: Date;
  }
  export type Item = Chat.Chat | Chat.Notice;
}
