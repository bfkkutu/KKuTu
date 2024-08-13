import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import Gauge from "front/@block/Gauge";
import { Room } from "front/KKuTu/box/Room";
import { useSocket, useStore } from "front/KKuTu/Store";
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
    const { l } = useLexicon(lKKuTu);

    return <>{l("profile_title", l("robot"))}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const room = Room.useStore((state) => state.room);

    const footerButtons: React.ReactNode[] = [];

    if (room !== undefined && room.master === id) {
      footerButtons.push(
        <button
          key={footerButtons.length}
          onClick={async () => {
            if (!(await window.confirm(l("confirm_kick", l("robot"))))) {
              return;
            }
            socket.send(WebSocketMessage.Type.KickRobot, {
              target: this.robot,
            });
            try {
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.UpdateRoom
              );
              this.hide();
            } catch (e) {
              const { errorType } =
                e as WebSocketError.Message[WebSocketError.Type];
              window.alert(l("error", errorType));
            }
          }}
        >
          {l("kick")}
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
                <div className="nickname ellipse">{l("robot")}</div>
              </div>
              <div className="item">
                <div className="level">
                  <LevelIcon
                    className="image"
                    level={1}
                    width={20}
                    height={20}
                  />
                  {l("unitLevel", 1)}
                </div>
                <div className="score">0 / 0점</div>
              </div>
              <div className="item gauge-wrapper">
                <Gauge
                  className="gauge-score"
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
        <div className="footer buttons">{footerButtons}</div>
      </div>
    );
  }
}

