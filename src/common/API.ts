import { Database as DB } from "common/Database";
import { KKuTu } from "common/KKuTu";

namespace API {
  export enum QueryType {
    Exact,
    Includes,
    StartsWith,
    EndsWith,
  }
  export interface GET {
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
      word: Omit<DB.Word, "id">;
    };
    ["/admin/database/words"]: {
      language: KKuTu.Game.Language;
      theme: string;
      words: string[];
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
