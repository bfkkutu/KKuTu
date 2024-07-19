import React from "react";

import L from "front/@global/Language";
import { useSocket, useStore } from "front/KKuTu/Store";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import Gauge from "front/@block/Gauge";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Whisper } from "front/KKuTu/dialogs/Whisper";
import { Room } from "front/KKuTu/box/Room";
import ReportDialog from "front/KKuTu/dialogs/Report";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";
import { Database } from "../../../common/Database";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class ProfileDialog extends Dialog {
  private user: Database.User.Summarized;

  constructor(user: Database.User.Summarized) {
    super();

    this.user = user;
  }

  protected override head(): React.ReactElement {
    return <>{L.render("profile_title", this.user.nickname)}</>;
  }
  protected override body(): React.ReactElement {
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
          {L.get("report")}
        </button>
      );
      if (room !== undefined && room.master === id) {
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  L.render("confirm_handover", this.user.nickname)
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
            {L.get("handover")}
          </button>
        );
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  L.render("confirm_kick", this.user.nickname)
                ))
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
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={() => Whisper.toggle(this.user)}
          >
            {L.get("whisper")}
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
                  L.render("confirm_friendRequest", this.user.nickname)
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
                    window.alert(L.get("error_404"));
                    break;
                  case WebSocketError.Type.BadRequest:
                    window.alert(
                      L.get("error_friendRequestAlreadyInBlackList")
                    );
                    break;
                }
              }
              window.alert(L.get("alert_friendRequest", this.user.nickname));
            }}
          >
            {L.get("friendRequest")}
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
                  L.render("confirm_blackListAdd", this.user.nickname)
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
                    window.alert(L.get("error_404"));
                    break;
                  case WebSocketError.Type.BadRequest:
                    window.alert(L.get("error_blackListAlreadyFriend"));
                    break;
                }
              }
              window.alert(L.render("alert_blackListAdd", this.user.nickname));
            }}
          >
            {L.get("blackListAdd")}
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
                  {L.get("unitLevel", level)}
                </div>
                <div className="score">
                  {this.user.score.toLocaleString()} / {goal.toLocaleString()}점
                </div>
              </div>
              <div className="item gauge-wrapper">
                <Gauge
                  className="gauge-exp"
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

