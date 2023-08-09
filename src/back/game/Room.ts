import WebSocketGroup from "back/utils/WebSocketGroup";

export default class Room extends WebSocketGroup {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }
}
