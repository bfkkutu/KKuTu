import Insert from "front/Administration/pages/DatabaseWord/menus/Insert";
import Query from "front/Administration/pages/DatabaseWord/menus/Query";
import Delete from "front/Administration/pages/DatabaseWord/menus/Delete";

namespace DatabaseWord {
  export const MENUS: React.FC<{}>[] = [Insert, Query, Delete];
}

export default DatabaseWord;
