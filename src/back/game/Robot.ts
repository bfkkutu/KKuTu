import User from "back/models/User";

export default class Robot extends User {
  private static id = 0;

  /**
   * 로봇을 초기화한다.
   * 로봇은 채널 대신 각 방 객체가 직접 관리한다.
   */
  constructor() {
    super();

    this.id = `robot${Robot.id++}`;
    this.createdAt = new Date().getTime();
  }

  public isRobot(): this is Robot {
    return true;
  }
}
