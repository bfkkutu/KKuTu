import Express from "express";
import https from "https";

import DB from "back/utils/Database";
import ExpressAgent from "back/utils/ExpressAgent";
import { loadLanguages } from "back/utils/Language";
import Route from "back/utils/Route";
import {
  loadEndpoints,
  SETTINGS,
  writeClientConstants,
} from "back/utils/System";
import { Logger } from "back/utils/Logger";
import LoginRoute from "back/utils/LoginRoute";
import { createSecureOptions } from "back/utils/Secure";
import Channel from "back/game/Channel";

const App = Express();

(async () => {
  await DB.initialize();
  loadLanguages();
  loadEndpoints();
  writeClientConstants();
  ExpressAgent(App);
  Route(App);
  await LoginRoute(App);
  App.use((_, res) => res.sendStatus(404));
  if (SETTINGS.secure.ssl)
    https
      .createServer(createSecureOptions(), App)
      .listen(SETTINGS.ports.https, () => {
        Logger.success("HTTPS Server").put(SETTINGS.ports.https).out();
      });
  else App.listen(SETTINGS.ports.http);
  for (const idx in SETTINGS.ports.channel) {
    Channel.instances[idx] = new Channel(
      SETTINGS.ports.channel[idx],
      SETTINGS.secure.ssl
    );
    Logger.info(`Channel #${idx} ready.`).out();
  }
})();
process.on("unhandledRejection", (err) => {
  const content = err instanceof Error ? err.stack : String(err);

  Logger.error("Unhandled promise rejection").put(content).out();
});
