import React from "react";

import L from "front/@global/Language";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import Gauge from "front/@block/Gauge";
import { Dialog } from "front/@global/Bayadere/Dialog";

export default class RobotProfileDialog extends Dialog {
  /**
   * 로봇 식별자.
   * 서버와 통신 시 사용한다. (강퇴 등)
   */
  private robot: string;

  constructor(robot: string) {
    super();

    this.robot = robot;
  }

  public override head(): React.ReactElement {
    return <>{L.render("profile_title", L.get("robot"))}</>;
  }
  public override body(): React.ReactElement {
    const footerButtons: React.ReactNode[] = [];

    return (
      <div className="dialog-profile">
        <div className="body">
          <section className="profile">
            <Moremi equipment={{}} />
            <div>
              <div className="item">
                <ProfileImage
                  src="/media/image/kkutu/robot.png"
                  width={20}
                  height={20}
                />
                <div className="nickname ellipse">{L.get("robot")}</div>
              </div>
              <div className="item">
                <div className="level">
                  <LevelIcon
                    className="image"
                    level={1}
                    width={20}
                    height={20}
                  />
                  {L.get("unitLevel", 1)}
                </div>
                <div className="score">0 / 0점</div>
              </div>
              <div className="item gauge-wrapper">
                <Gauge value={0} max={0} width={250} height={20} />
              </div>
            </div>
          </section>
          <section>RECORD</section>
        </div>
        <div className="footer">{footerButtons}</div>
      </div>
    );
  }
}
