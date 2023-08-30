import { create } from "zustand";

import { Game } from "common/Game";

interface State {
  room?: Game.DetailedRoom;
  updateRoom: (room: Game.DetailedRoom) => void;
  addMember: (member: Game.RoomMember) => void;
  removeMember: (id: string) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<State>((setState) => ({
  room: undefined,
  updateRoom: (room) => setState({ room }),
  addMember: (member) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      return { room: { ...room, members: [...room.members, member] } };
    }),
  removeMember: (id) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      return {
        room: {
          ...room,
          members: room.members.filter((v) => v.id !== id),
        },
      };
    }),
  leaveRoom: () => setState({ room: undefined }),
}));
