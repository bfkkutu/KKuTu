import { Database as DB } from "common/Database";
import { KKuTu } from "common/KKuTu";

namespace API {
  export interface POST {
    ["/admin/database/word"]: {
      language: KKuTu.Game.Language;
      word: Omit<DB.Word, "id">;
    };
  }
}

export default API;
