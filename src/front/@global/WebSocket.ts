import { useStore } from "front/Game/Store";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { WebSocketMessage } from "../../common/WebSocket";
import { Database } from "common/Database";

export type EventListener<T extends WebSocketMessage.Type> = (
  message: WebSocketMessage.Server[T]
) => void | Promise<void>;

class MessageReceiver {
  private listeners = Object.values(WebSocketMessage.Type).reduce(
    (prev, curr) => {
      prev[curr] = [];
      return prev;
    },
    {} as Record<WebSocketMessage.Type, EventListener<any>[]>
  );

  public async emit<T extends WebSocketMessage.Type>(
    message: WebSocketMessage.Server[T]
  ) {
    console.log(message);
    // 각 listener 호출 시 this.listeners[message.type] 배열의 내용이 바뀔 수 있으니 얕은 복사로 다음 listener가 무시되지 않도록 한다.
    for (const listener of [...this.listeners[message.type]])
      await listener(message);
  }
  public on<T extends WebSocketMessage.Type>(
    type: T,
    listener: EventListener<T>
  ): void {
    if (!(type in this.listeners)) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }
  public off<T extends WebSocketMessage.Type>(
    type: T,
    listener?: EventListener<T>
  ): void {
    if (listener === undefined) this.listeners[type].length = 0;
    else
      this.listeners[type].splice(
        this.listeners[type].findIndex((v) => v === listener),
        1
      );
  }
  public wait<T extends WebSocketMessage.Type>(
    type: T
  ): Promise<WebSocketMessage.Server[T]> {
    return new Promise((resolve, reject) => {
      const { show, hide } = Spinner.useStore.getState();
      const cleanup = () => {
        this.off(type, callback);
        this.off(WebSocketMessage.Type.Error, errorCallback);
        hide();
      };
      const callback: EventListener<T> = (message) => {
        cleanup();
        resolve(message);
      };
      const errorCallback: EventListener<WebSocketMessage.Type.Error> = (
        message
      ) => {
        cleanup();
        reject(message);
        if (message.isFatal) useStore.getState().socket.close();
      };
      show();
      this.on(type, callback);
      this.on(WebSocketMessage.Type.Error, errorCallback);
    });
  }
}

const C =
  typeof window === "undefined" ? (class Dummy {} as never) : window.WebSocket;
class WebSocket extends C {
  public messageReceiver = new MessageReceiver();

  constructor(url: string) {
    super(url);

    this.on("message", ({ data }) =>
      this.messageReceiver.emit(JSON.parse(data))
    );
  }

  public on = this.addEventListener;
  public off = this.removeEventListener;
  // @ts-ignore
  public override send<T extends WebSocketMessage.Type>(
    type: T,
    content: WebSocketMessage.Content.Client[T]
  ): void {
    super.send(
      JSON.stringify({
        type,
        ...content,
      } as WebSocketMessage.Client[T])
    );
  }
  /**
   * 데이터베이스에서 유저 정보를 쿼리한다.
   * 해당 유저가 접속 중이 아니거나
   * 해당 유저의 접속 여부가 불확실할 때
   * 사용한다.
   *
   * @param id 유저 식별자
   * @returns 유저 정보의 Promise
   */
  public async queryUser(
    id: string
  ): Promise<Database.User.Summarized | undefined> {
    this.send(WebSocketMessage.Type.QueryUser, {
      target: id,
    });
    return (await this.messageReceiver.wait(WebSocketMessage.Type.QueryUser))
      .user;
  }
}
export default WebSocket;
