import React from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import Moremi from "front/@block/Moremi";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import Gauge from "front/@block/Gauge";

export const createProfileDialog = (user: Database.SummarizedUser) => {
  const id = useStore((state) => state.me.id);
  const level = getLevel(user.score);
  const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
  const goal = CLIENT_SETTINGS.expTable[level - 1];
  const footerButtons: React.ReactNode[] = [];

  if (user.id !== id)
    footerButtons.push(
      <button
        onClick={async () => {
          await confirm(L.render("confirm_friendRequest", user.nickname));
        }}
      >
        {L.get("friendRequest")}
      </button>
    );

  return new DialogTuple(L.get("profile_title", user.nickname), () => {
    return (
      <>
        <div className="body dialog-profile">
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
      </>
    );
  });
};
