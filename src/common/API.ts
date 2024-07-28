import { Database } from "common/Database";
import { KKuTu } from "common/KKuTu";

namespace API {
  export enum QueryType {
    Exact,
    Includes,
    StartsWith,
    EndsWith,
  }
  export interface GET {
    ["/admin/owner/appointment"]: {
      id: string;
    };

    ["/admin/database/word"]: {
      language: KKuTu.Game.Language;
      data: string;
    };
    ["/admin/database/words"]: {
      language: KKuTu.Game.Language;
      type: `${QueryType}`;
      data: string;
    };
  }
  export interface POST {
    ["/admin/database/word"]: {
      language: KKuTu.Game.Language;
      word: Omit<Database.Word, "id">;
    };
    ["/admin/database/words"]: {
      language: KKuTu.Game.Language;
      theme: string;
      words: string[];
    };
  }
  export interface PUT {
    ["/admin/owner/appointment"]: {
      id: string;
      departures: number;
    };
  }
  export interface DELETE {
    ["/admin/database/word"]: {
      language: KKuTu.Game.Language;
      id: string;
    };
  }
}

export default API;
