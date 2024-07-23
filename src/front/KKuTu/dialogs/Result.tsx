import React from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";
import { getLevel } from "front/@global/Utility";
import LevelIcon from "front/@block/LevelIcon";
import Gauge from "front/@block/Gauge";
import { useStore } from "front/KKuTu/Store";
import { KKuTu } from "common/KKuTu";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class ResultDialog extends Dialog {
  private readonly result: KKuTu.Game.Result;

  constructor(result: KKuTu.Game.Result) {
    super();

    this.result = result;
  }

  protected override head(): React.ReactElement {
    return <>{L.get("result_title")}</>;
  }
  protected override body(): React.ReactElement {
    const me = useStore((state) => state.me);
    const users = useStore((state) => state.users);

    const level = getLevel(me.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];

    return (
      <div className="dialog-result">
        <div className="body">
          <ul>
            {this.result.scores.map(([id, score], index) => {
              const user = id === me.id ? me : users[id];
              if (user === undefined) {
                return null;
              }
              return (
                <li key={index}>
                  <span>{index + 1}</span>
                  <LevelIcon
                    level={getLevel(user.score)}
                    width={18}
                    height={18}
                  />
                  <span className="ellipse">{user.nickname}</span>
                  <span>{L.get("unitScore", score.value)}</span>
                  <span>+{score.gain}</span>
                </li>
              );
            })}
          </ul>
          {this.result.gain === undefined ? null /* 관전자 */ : (
            <div className="me">
              <div className="gain">
                <span>
                  {L.get("result_score")} +{this.result.gain.score}
                </span>
                <span>
                  {L.get("result_money")} +{this.result.gain.money}
                </span>
              </div>
              <div className="score">
                <div className="gauge-desc">
                  <span>{L.get("level")}</span>
                  <span className="level">{level}</span>
                </div>
                <Gauge
                  className="gauge-score"
                  value={me.score - prev}
                  max={goal - prev}
                  width={280}
                  height={45}
                />
              </div>
            </div>
          )}
        </div>
        <div className="footer buttons">
          <button onClick={() => window.alert(L.get("underDevelopment"))}>
            {L.get("result_save")}
          </button>
          <button onClick={() => this.hide()}>{L.get("ok")}</button>
        </div>
      </div>
    );
  }
}
