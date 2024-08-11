import React from "react";
import { create } from "zustand";

import { KKuTu } from "../../../../common/KKuTu";

import General from "front/KKuTu/box/Game/interfaces/General";

namespace Game {
  export interface Props {
    mode: KKuTu.Game.Mode;
  }
  export type State<T> = globalThis.State<{
    game?: T;
  }> & {
    initialize: (initializer: T) => void;
    deinitialize: () => void;
    update: (state: Partial<T>) => void;
  };
  export const useStore = create<
    State<KKuTu.Game.Interface.Serialized[KKuTu.Game.Interface]>
  >((setState) => ({
    game: undefined,

    initialize: (initializer) => setState({ game: initializer }),
    deinitialize: () => setState({ game: undefined }),
    update: (state) =>
      setState((prev) => {
        if (prev.game === undefined) {
          return {};
        }
        return { game: { ...prev.game, ...state } };
      }),
  }));

  export const INTERFACES: Record<KKuTu.Game.Interface, React.FC<Props>> = {
    [KKuTu.Game.Interface.General]: General,
    [KKuTu.Game.Interface.TODO]: () => null,
  };
}

export default Game;

