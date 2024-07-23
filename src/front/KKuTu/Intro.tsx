import React, { useEffect, useRef, useState } from "react";

import L from "front/@global/Language";
import AudioContext from "front/@global/AudioContext";
import { getRequiredScore } from "front/@global/Utility";
import { useDetector, useSocket, useStore } from "front/KKuTu/Store";
import Gauge from "front/@block/Gauge";
import { WebSocketMessage } from "../../common/WebSocket";
import { CLIENT_SETTINGS } from "back/utils/Utility";

CLIENT_SETTINGS.expTable.push(getRequiredScore(1));
for (let i = 2; i < CLIENT_SETTINGS.maxLevel; i++)
  CLIENT_SETTINGS.expTable.push(
    CLIENT_SETTINGS.expTable[i - 2] + getRequiredScore(i)
  );
CLIENT_SETTINGS.expTable[CLIENT_SETTINGS.maxLevel - 1] = Infinity;
CLIENT_SETTINGS.expTable.push(Infinity);

interface Props {
  url: string;
  version: React.ReactNode;
}
export default function Intro(props: Props) {
  const [socket, connect, disconnect] = useSocket((state) => [
    state.socket,
    state.connect,
    state.disconnect,
  ]);
  const load = useDetector((state) => state.load);
  const updateMe = useStore((state) => state.updateMe);
  const initializeUsers = useStore((state) => state.initializeUsers);
  const [args, setArgs] = useState<[string, ...string[]]>(["connecting"]);
  const [progress, setProgress] = useState(0);

  const $ = useRef<HTMLDivElement>(null);

  const SOUNDS = Object.entries(CLIENT_SETTINGS.sounds);

  useEffect(() => {
    (async () => {
      try {
        const detector = await load();
        if (detector.detect().bot) {
          window.alert(L.get("alert_botdDetected"));
          disconnect();
        }
      } catch (e) {
        window.alert(L.get("alert_botdFailed"));
        disconnect();
      }
    })();

    connect(props.url);
  }, []);

  useEffect(() => {
    if (socket === undefined) {
      return;
    }

    socket.on("open", async () => {
      const { me, users } = await socket.messageReceiver.wait(
        WebSocketMessage.Type.Initialize
      );
      updateMe(me);
      initializeUsers(users);
      for (let i = 0; i < SOUNDS.length; ++i) {
        setProgress(i);
        const [id, src] = SOUNDS[i];
        try {
          setArgs(["loading_resource", src]);
          await AudioContext.instance.register(id, `/media/sound${src}`);
        } catch (e) {
          window.alert(L.get("error_soundNotFound", id));
        }
      }
      setProgress(SOUNDS.length);
      AudioContext.instance.volume = me.settings.bgmVolume;
      AudioContext.instance.play(`lobby_${me.settings.lobbyMusic}`, true);
      const intro = $.current;
      if (intro !== null) {
        intro.style.opacity = "0";
        window.setTimeout(() => intro.remove(), 2000);
      }
      socket.send(WebSocketMessage.Type.Initialize, {});
    });
    socket.on("close", (e) => {
      AudioContext.instance.stopAll();
      window.alert(L.get("error_closed", e.code));
    });
  }, [socket]);

  return (
    <div ref={$} id="intro">
      <img className="image" src="/media/image/kkutu/intro.png" />
      <div className="version">{props.version}</div>
      <div className="text">{L.get(...args)}</div>
      <div className="gauge-wrapper">
        <Gauge
          className="gauge"
          max={100}
          value={Math.round((progress / SOUNDS.length) * 100)}
          width={600}
          height={20}
          format={({ value }) => <>{L.get("unitPercent", value)}</>}
        />
      </div>
    </div>
  );
}
