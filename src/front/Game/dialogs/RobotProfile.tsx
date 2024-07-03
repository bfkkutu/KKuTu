import React from "react";

import L from "front/@global/Language";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import Gauge from "front/@block/Gauge";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Room } from "front/Game/box/Room";
import { useStore } from "front/Game/Store";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";

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

  protected override head(): React.ReactElement {
    return <>{L.render("profile_title", L.get("robot"))}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const room = Room.useStore((state) => state.room);
    const hide = Dialog.useStore((state) => state.hide);

    const footerButtons: React.ReactNode[] = [];

    if (room !== undefined && room.master === id) {
      footerButtons.push(
        <button
          key={footerButtons.length}
          onClick={async () => {
            if (
              !(await window.confirm(L.render("confirm_kick", L.get("robot"))))
            ) {
              return;
            }
            socket.send(WebSocketMessage.Type.KickRobot, {
              target: this.robot,
            });
            try {
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.UpdateRoom
              );
              hide(this);
            } catch (e) {
              const { errorType } =
                e as WebSocketError.Message[WebSocketError.Type];
              switch (errorType) {
                case WebSocketError.Type.BadRequest:
                  window.alert(L.get("error_400"));
                  break;
                case WebSocketError.Type.NotFound:
                  window.alert(L.get("error_404"));
                  break;
                case WebSocketError.Type.Forbidden:
                  window.alert(L.get("error_403"));
                  break;
              }
            }
          }}
        >
          {L.get("kick")}
        </button>
      );
    }

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
                <Gauge
                  className="gauge-exp"
                  value={0}
                  max={0}
                  width={250}
                  height={20}
                />
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
