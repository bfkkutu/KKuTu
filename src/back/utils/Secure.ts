import { SETTINGS, getProjectData } from "back/utils/System";

export const SECURE_OPTIONS = {
  key: getProjectData(SETTINGS.secure.key),
  cert: getProjectData(SETTINGS.secure.cert),
  ca: getProjectData(SETTINGS.secure.ca),
};
