import User from "back/models/User";

export default class Robot extends User {
  private static id = 0;

  constructor() {
    super();

    this.id = `robot${Robot.id++}`;
    this.createdAt = new Date().getTime();
  }

  public isRobot(): this is Robot {
    return true;
  }
}
