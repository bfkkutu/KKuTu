import Express from "express";
import https from "https";
import { error, info, success } from "@daldalso/logger";

import Channel from "back/game/Channel";
import DB from "back/utils/Database";
import ExpressAgent from "back/utils/ExpressAgent";
import Route from "back/utils/Route";
import {
  loadEndpoints,
  SETTINGS,
  writeClientConstants,
} from "back/utils/System";
import LoginRoute from "back/utils/LoginRoute";
import { createSecureOptions } from "back/utils/Secure";

const App = Express();

(async () => {
  await DB.initialize();
  loadEndpoints();
  writeClientConstants();
  ExpressAgent(App);
  Route(App);
  await LoginRoute(App);
  App.use((_, res) => res.sendStatus(404));
  if (SETTINGS.secure.ssl) {
    https
      .createServer(createSecureOptions(), App)
      .listen(SETTINGS.ports.https, () => {
        success`HTTPS Server`["Port"](SETTINGS.ports.https);
      });
  } else {
    App.listen(SETTINGS.ports.http, () => {
      success`HTTP Server`["Port"](SETTINGS.ports.http);
    });
  }
  for (const idx in SETTINGS.channel) {
    Channel.instances[idx] = new Channel(
      SETTINGS.channel[idx].ports.internal,
      SETTINGS.secure.ssl
    );
    info`Channel #${idx} ready.`;
  }
})();
process.on("unhandledRejection", (err) => {
  const content = err instanceof Error ? err.stack : String(err);

  error`Unhandled promise rejection`["Error"](content);
});

