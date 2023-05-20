/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import fs from "fs";
import https from "https";
import { SETTINGS } from "./System";

export default function Secure() {
  const options: https.ServerOptions = {};
  if (SETTINGS.secure.isPFX == true) {
    options.pfx = fs.readFileSync(SETTINGS.secure.pfx);
    options.passphrase = SETTINGS.secure.pfxPass;
  } else {
    options.key = fs.readFileSync(SETTINGS.secure.key);
    options.cert = fs.readFileSync(SETTINGS.secure.cert);
    if (SETTINGS.secure.isCA) {
      options.ca = fs.readFileSync(SETTINGS.secure.ca);
    }
  }
  return options;
}
