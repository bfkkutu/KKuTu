import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import AudioContext from "front/@global/AudioContext";
import { Dialog } from "front/@global/bayadere/Dialog";
import { Spinner } from "front/@global/bayadere/Spinner";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import { useSocket, useStore } from "front/KKuTu/Store";
import { WebSocketMessage } from "../../../common/WebSocket";
import { Database } from "../../../common/Database";
import { Iterator } from "../../../common/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class SettingsDialog extends Dialog {
  /**
   * Dialog 생성 당시 설정 값.
   */
  private readonly settings: Database.JSON.Types.User.settings;
  private isSaving = false;

  constructor(settings: Database.JSON.Types.User.settings) {
    super();

    this.settings = { ...settings };
  }

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return <>{l("settings_title")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const [me, updateMe] = useStore((state) => [state.me, state.updateMe]);
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);
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
      <div className="dialog-settings">
        <form className="body">
          <label>
            <label className="dialog-desc" htmlFor="settings-input-bgm-volume">
              {l("settings_bgmVolume")}
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
            <label
              className="dialog-desc"
              htmlFor="settings-input-effect-volume"
            >
              {l("settings_effectVolume")}
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
                  effectVolume: (AudioContext.instance.effectVolume =
                    parseFloat(e.currentTarget.value.substring(0, 4))),
                })
              }
            />
          </label>
          <label>
            <label className="dialog-desc" htmlFor="settings-select-bgm">
              {l("settings_bgm")}
            </label>
            <select
              id="settings-select-bgm"
              value={me.settings.lobbyMusic}
              onChange={async (e) => {
                const lobbyMusic = parseInt(e.currentTarget.value);
                const prev = `lobby_${me.settings.lobbyMusic}`;
                const id = `lobby_${lobbyMusic}`;
                updateSettings({
                  lobbyMusic,
                });

                if (!AudioContext.instance.isPlaying(prev)) {
                  return;
                }
                if (!AudioContext.instance.isRegistered(id)) {
                  show();
                  try {
                    await AudioContext.instance.register(
                      id,
                      `/media/sound${CLIENT_SETTINGS.sounds.lazy[id]}`
                    );
                  } catch (e) {
                    window.alert(l("error_soundNotFound", id));
                    return;
                  } finally {
                    hide();
                  }
                }
                AudioContext.instance.stop(prev);
                AudioContext.instance.play(id, true);
              }}
            >
              {Iterator(4)
                .map((_, index) => index + 1)
                .map((id) => (
                  <option key={id} value={id}>
                    {id}. {l("bgm_lobby", id)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <label className="dialog-desc" htmlFor="settings-select-locale">
              {l("settings_locale")}
            </label>
            <select
              id="settings-select-locale"
              value={me.settings.locale}
              onChange={(e) => {
                updateSettings({
                  locale: e.currentTarget.value,
                });
                window.alert(l("alert_localeChanged"));
              }}
            >
              {Object.entries(CLIENT_SETTINGS.languageSupport).map(
                ([k, v], index) => (
                  <option key={index} value={k}>
                    {v}
                  </option>
                )
              )}
            </select>
          </label>
          <label>
            <label className="dialog-desc">{l("settings_refuse")}</label>
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
                  {l("invite")}
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
                  {l("whisper")}
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
                  {l("friendRequest")}
                </label>
              </label>
            </div>
          </label>
          <label>
            <label className="dialog-desc">{l("settings_game")}</label>
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
                  {l("autoReady")}
                </label>
              </label>
            </div>
          </label>
          <label>
            <label className="dialog-desc">
              {l("settings_filterProfanities")}
            </label>
            <div className="checkbox-wrapper">
              <label>
                <input
                  type="checkbox"
                  id="settings-checkbox-filterProfanities"
                  checked={me.settings.filterProfanities}
                  onChange={(e) =>
                    updateSettings({
                      filterProfanities: e.currentTarget.checked,
                    })
                  }
                />
              </label>
            </div>
          </label>
        </form>
        <div className="footer buttons">
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
              this.isSaving = true;
              this.hide();
              window.alert(l("settings_alert_saved"));
            }}
          >
            {l("save")}
          </button>
        </div>
        <span className="uid">UID: {me.id}</span>
      </div>
    );
  }

  public override onHide() {
    if (!this.isSaving) {
      const state = useStore.getState();
      AudioContext.instance.volume = this.settings.bgmVolume;
      AudioContext.instance.effectVolume = this.settings.effectVolume;
      useStore.setState({
        ...state,
        me: {
          ...state.me,
          settings: this.settings,
        },
      });
    }
  }
}

