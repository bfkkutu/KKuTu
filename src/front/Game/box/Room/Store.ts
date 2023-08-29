import { create } from "zustand";

import { Game } from "common/Game";

interface State {
  room?: Game.DetailedRoom;
  updateRoom: (room: Game.DetailedRoom) => void;
  addMember: (id: string) => void;
  removeMember: (id: string) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<State>((setState) => ({
  room: undefined,
  updateRoom: (room) => setState({ room }),
  addMember: (id) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      return { room: { ...room, members: [...room.members, id] } };
    }),
  removeMember: (id) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      return {
        room: {
          ...room,
          members: room.members.filter((member) => member !== id),
        },
      };
    }),
  leaveRoom: () => setState({ room: undefined }),
}));
