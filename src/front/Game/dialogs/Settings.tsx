import React, { useState } from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import AudioContext from "front/@global/AudioContext";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { WebSocketMessage } from "../../../common/WebSocket";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";

export const SettingsDialog = new DialogTuple(L.get("settings_title"), () => {
  const [me, updateMe] = useStore((state) => [state.me, state.updateMe]);
  const socket = useStore((state) => state.socket);
  const hide = useDialogStore((state) => state.hide);
  const [valueChanged, setValueChanged] = useState(false);

  const updateSettings = (
    settings: Partial<Database.JSON.Types.User.settings>
  ) => {
    setValueChanged(true);
    updateMe({
      ...me,
      settings: {
        ...me.settings,
        ...settings,
      },
    });
  };

  return (
    <>
      <div className="body dialog-settings">
        <label>
          <label className="dialog-desc" htmlFor="settings-input-bgm-volume">
            {L.get("settings_bgmVolume")}
          </label>
          <input
            type="range"
            id="settings-input-bgm-volume"
            min={0}
            max={1}
            step={0.01}
            value={me.settings.bgmVolume}
            onChange={(e) =>
              updateSettings({
                bgmVolume: (AudioContext.instance.volume = parseFloat(
                  e.currentTarget.value.substring(0, 4)
                )),
              })
            }
          />
        </label>
        <label>
          <label className="dialog-desc" htmlFor="settings-input-effect-volume">
            {L.get("settings_effectVolume")}
          </label>
          <input
            type="range"
            id="settings-input-effect-volume"
            min={0}
            max={1}
            step={0.01}
            value={me.settings.effectVolume}
            onChange={(e) =>
              updateSettings({
                effectVolume: parseFloat(e.currentTarget.value.substring(0, 4)),
              })
            }
          />
        </label>
        <label>
          <label className="dialog-desc" htmlFor="settings-select-bgm">
            {L.get("settings_bgm")}
          </label>
          <select
            id="settings-select-bgm"
            value={me.settings.lobbyMusic}
            onChange={(e) => {
              AudioContext.instance.stop(`lobby_${me.settings.lobbyMusic}`);
              const lobbyMusic = parseInt(e.currentTarget.value);
              updateSettings({
                lobbyMusic,
              });
              AudioContext.instance.play(`lobby_${lobbyMusic}`, true);
            }}
          >
            {Object.keys(CLIENT_SETTINGS.sound)
              .filter((key) => key.startsWith("lobby_"))
              .map((key, idx) => {
                const id = key.split("_").at(-1);
                return (
                  <option value={id}>
                    {id}. {L.get(`bgm_${key}`)}
                  </option>
                );
              })}
          </select>
        </label>
        <label>
          <label className="dialog-desc">{L.get("settings_refuse")}</label>
          <div className="checkbox-wrapper">
            <label>
              <input
                type="checkbox"
                id="settings-checkbox-refuse-invite"
                checked={me.settings.refuse.invite}
                onChange={(e) =>
                  updateSettings({
                    refuse: {
                      ...me.settings.refuse,
                      invite: e.currentTarget.checked,
                    },
                  })
                }
              />
              <label htmlFor="settings-checkbox-refuse-invite">
                {L.get("invite")}
              </label>
            </label>
            <label>
              <input
                type="checkbox"
                id="settings-checkbox-refuse-whisper"
                checked={me.settings.refuse.whisper}
                onChange={(e) =>
                  updateSettings({
                    refuse: {
                      ...me.settings.refuse,
                      whisper: e.currentTarget.checked,
                    },
                  })
                }
              />
              <label htmlFor="settings-checkbox-refuse-whisper">
                {L.get("whisper")}
              </label>
            </label>
            <label>
              <input
                type="checkbox"
                id="settings-checkbox-refuse-friendRequest"
                checked={me.settings.refuse.friendRequest}
                onChange={(e) =>
                  updateSettings({
                    refuse: {
                      ...me.settings.refuse,
                      friendRequest: e.currentTarget.checked,
                    },
                  })
                }
              />
              <label htmlFor="settings-checkbox-refuse-friendRequest">
                {L.get("friendRequest")}
              </label>
            </label>
          </div>
        </label>
        <label>
          <label className="dialog-desc">{L.get("settings_game")}</label>
          <div className="checkbox-wrapper">
            <label>
              <input
                type="checkbox"
                id="settings-checkbox-autoReady"
                checked={me.settings.game.autoReady}
                onChange={(e) =>
                  updateSettings({
                    game: {
                      ...me.settings.game,
                      autoReady: e.currentTarget.checked,
                    },
                  })
                }
              />
              <label htmlFor="settings-checkbox-autoReady">
                {L.get("autoReady")}
              </label>
            </label>
          </div>
        </label>
      </div>
      <div className="footer">
        <button
          type="button"
          onClick={() => alert("이동 가능한 채널이 없습니다.")}
        >
          {L.get("moveServer")}
        </button>
        <button
          type="button"
          disabled={!valueChanged}
          onClick={async () => {
            socket.send(WebSocketMessage.Type.UpdateSettings, {
              settings: me.settings,
            });
            await socket.messageReceiver.wait(
              WebSocketMessage.Type.UpdateSettings
            );
            hide(SettingsDialog);
            alert("변경 사항이 저장되었습니다.");
          }}
        >
          {L.get("save")}
        </button>
      </div>
    </>
  );
});
