import User from "back/models/User";

export default class WebSocketGroup {
  private members = new Map<number, User<true>>();
}
