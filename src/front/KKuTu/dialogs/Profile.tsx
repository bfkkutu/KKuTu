import React from "react";
import { useLexicon } from "@daldalso/i18n";

import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import Gauge from "front/@block/Gauge";
import { useSocket, useStore } from "front/KKuTu/Store";
import { Whisper } from "front/KKuTu/dialogs/Whisper";
import ReportDialog from "front/KKuTu/dialogs/Report";
import { Room } from "front/KKuTu/box/Room";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";
import type { Database } from "../../../common/Database";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class ProfileDialog extends Dialog {
  private user: Database.User.Summarized;

  constructor(user: Database.User.Summarized) {
    super();

    this.user = user;
  }

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return <>{l("profile_title", this.user.nickname)}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const room = Room.useStore((state) => state.room);
    const community = useStore((state) => state.community);
    const toggle = Dialog.useStore((state) => state.toggle);

    const footerButtons: React.ReactNode[] = [];
    const reportDialog = new ReportDialog(this.user);

    const level = getLevel(this.user.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];

    if (this.user.id !== id) {
      footerButtons.push(
        <button key={footerButtons.length} onClick={() => toggle(reportDialog)}>
          {l("report")}
        </button>
      );
      if (room !== undefined && room.master === id) {
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  l("confirm_handover", this.user.nickname)
                ))
              ) {
                return;
              }
              socket.send(WebSocketMessage.Type.Handover, {
                target: this.user.id,
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
            {l("handover")}
          </button>
        );
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(l("confirm_kick", this.user.nickname)))
              ) {
                return;
              }
              socket.send(WebSocketMessage.Type.Kick, {
                target: this.user.id,
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
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={() => Whisper.toggle(this.user)}
          >
            {l("whisper")}
          </button>
        );
      }
      if (!community.friends.includes(this.user.id)) {
        footerButtons.push(
          <button
            key={footerButtons.length}
            disabled={community.friendRequests.sent.includes(this.user.id)}
            onClick={async () => {
              if (
                !(await window.confirm(
                  l("confirm_friendRequest", this.user.nickname)
                ))
              )
                return;
              socket.send(WebSocketMessage.Type.FriendRequest, {
                target: this.user.id,
              });
              try {
                await socket.messageReceiver.wait(
                  WebSocketMessage.Type.FriendRequest
                );
              } catch (e) {
                const { errorType } =
                  e as WebSocketError.Message[WebSocketError.Type];
                switch (errorType) {
                  case WebSocketError.Type.NotFound:
                    window.alert(l("error", 404));
                    break;
                  case WebSocketError.Type.BadRequest:
                    window.alert(l("error_friendRequestAlreadyInBlackList"));
                    break;
                }
              }
              window.alert(l("alert_friendRequest", this.user.nickname));
            }}
          >
            {l("friendRequest")}
          </button>
        );
      }
      if (!community.blackList.includes(this.user.id)) {
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  l("confirm_blackListAdd", this.user.nickname)
                ))
              )
                return;
              socket.send(WebSocketMessage.Type.BlackListAdd, {
                target: this.user.id,
              });
              try {
                await socket.messageReceiver.wait(
                  WebSocketMessage.Type.UpdateCommunity
                );
              } catch (e) {
                const { errorType } =
                  e as WebSocketError.Message[WebSocketError.Type];
                switch (errorType) {
                  case WebSocketError.Type.NotFound:
                    window.alert(l("error", 404));
                    break;
                  case WebSocketError.Type.BadRequest:
                    window.alert(l("error_blackListAlreadyFriend"));
                    break;
                }
              }
              window.alert(l("alert_blackListAdd", this.user.nickname));
            }}
          >
            {l("blackListAdd")}
          </button>
        );
      }
    }

    return (
      <div className="dialog-profile">
        <div className="body">
          <section className="profile">
            <Moremi equipment={this.user.equipment} />
            <div>
              <div className="item">
                <ProfileImage src={this.user.image} width={20} height={20} />
                <div className="nickname ellipse">{this.user.nickname}</div>
              </div>
              <div className="item">
                <div className="level">
                  <LevelIcon
                    className="image"
                    level={level}
                    width={20}
                    height={20}
                  />
                  {l("unitLevel", level)}
                </div>
                <div className="score">
                  {this.user.score.toLocaleString()} /{" "}
                  {l("unitScoreWithCommas", goal)}
                </div>
              </div>
              <div className="item gauge-wrapper">
                <Gauge
                  className="gauge-score"
                  value={this.user.score - prev}
                  max={goal - prev}
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

