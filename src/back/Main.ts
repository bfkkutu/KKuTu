import Express from "express";
import https from "https";

import DB from "back/utils/Database";
import ExpressAgent from "back/utils/ExpressAgent";
import { loadLanguages } from "back/utils/Language";
import Route from "back/utils/Route";
import {
  getProjectData,
  loadEndpoints,
  SETTINGS,
  writeClientConstants,
} from "back/utils/System";
import { Logger } from "back/utils/Logger";
import LoginRoute from "./utils/LoginRoute";

const HTTPS_OPTIONS: https.ServerOptions | null = SETTINGS.secure.ssl
  ? {
      key: getProjectData(SETTINGS.secure.key),
      cert: getProjectData(SETTINGS.secure.cert),
      ca: getProjectData(SETTINGS.secure.ca),
    }
  : null;
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
  if (HTTPS_OPTIONS === null) App.listen(SETTINGS.ports.http);
  else
    https.createServer(HTTPS_OPTIONS, App).listen(SETTINGS.ports.https, () => {
      Logger.success("HTTPS Server").put(SETTINGS.ports.https).out();
    });
})();
process.on("unhandledRejection", (err) => {
  const content = err instanceof Error ? err.stack : String(err);

  Logger.error("Unhandled promise rejection").put(content).out();
});
