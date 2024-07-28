import { Database } from "common/Database";
import { KKuTu } from "common/KKuTu";

namespace API {
  type bool = `${0 | 1}`;
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
      full?: bool;
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

    ["/admin/database/word"]: {
      language: KKuTu.Game.Language;
      word: Database.Word;
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
