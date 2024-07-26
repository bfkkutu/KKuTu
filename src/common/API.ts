import { Database as DB } from "common/Database";
import { KKuTu } from "common/KKuTu";

namespace API {
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
}

export default API;
