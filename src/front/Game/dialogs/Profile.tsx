import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import Gauge from "front/@block/Gauge";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { WhisperDialog } from "front/Game/dialogs/Whisper";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";
import { Database } from "../../../common/Database";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export const createProfileDialog = (user: Database.User.Summarized) => {
  const dialog = new Dialog(L.render("profile_title", user.nickname), () => {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const room = Room.useStore((state) => state.room);
    const community = useStore((state) => state.community);
    const hide = Dialog.useStore((state) => state.hide);

    const footerButtons: React.ReactNode[] = [];
    const level = getLevel(user.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];

    if (user.id !== id) {
      footerButtons.push(
        <button
          key={footerButtons.length}
          onClick={() => WhisperDialog.toggle(user)}
        >
          {L.get("whisper")}
        </button>
      );
      if (room !== undefined && room.master === id)
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  L.render("confirm_handover", user.nickname)
                ))
              )
                return;
              socket.send(WebSocketMessage.Type.HandoverRoom, {
                master: user.id,
              });
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.HandoverRoom
              );
              hide(dialog);
            }}
          >
            {L.get("handover")}
          </button>
        );
      if (!community.friends.includes(user.id))
        footerButtons.push(
          <button
            key={footerButtons.length}
            disabled={community.friendRequests.sent.includes(user.id)}
            onClick={async () => {
              if (
                !(await window.confirm(
                  L.render("confirm_friendRequest", user.nickname)
                ))
              )
                return;
              socket.send(WebSocketMessage.Type.FriendRequest, {
                target: user.id,
              });
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.FriendRequest
              );
              window.alert(L.get("alert_friendRequest", user.nickname));
            }}
          >
            {L.get("friendRequest")}
          </button>
        );
      if (!community.blackList.includes(user.id))
        footerButtons.push(
          <button
            key={footerButtons.length}
            onClick={async () => {
              if (
                !(await window.confirm(
                  L.render("confirm_blackListAdd", user.nickname)
                ))
              )
                return;
              socket.send(WebSocketMessage.Type.BlackListAdd, {
                userId: user.id,
              });
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.UpdateCommunity
              );
              window.alert(L.render("alert_blackListAdd", user.nickname));
            }}
          >
            {L.get("blackListAdd")}
          </button>
        );
    }

    return (
      <div className="dialog-profile">
        <div className="body">
          <section className="profile">
            <Moremi equipment={user.equipment} />
            <div>
              <div className="item">
                <ProfileImage src={user.image} width={20} height={20} />
                <div className="nickname ellipse">{user.nickname}</div>
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
                  {user.score.toLocaleString()} / {goal.toLocaleString()}점
                </div>
              </div>
              <div className="item gauge-wrapper">
                <Gauge
                  value={user.score - prev}
                  max={goal - prev}
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
  });
  return dialog;
};
