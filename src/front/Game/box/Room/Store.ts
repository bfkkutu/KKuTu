import { create } from "zustand";

import { Game } from "common/Game";

interface State {
  room?: Game.DetailedRoom;
  updateRoom: (room: Game.DetailedRoom) => void;
  addMember: (member: Game.RoomMember) => void;
  updateMember: (member: Partial<Game.RoomMember>) => void;
  removeMember: (id: string) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<State>((setState) => ({
  room: undefined,
  updateRoom: (room) => setState({ room }),
  addMember: (member) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      return {
        room: { ...room, members: { ...room.members, [member.id]: member } },
      };
    }),
  updateMember: (member) =>
    setState(({ room }) => {
      if (member.id === undefined || room === undefined) return { room };
      return {
        room: {
          ...room,
          members: {
            ...room.members,
            [member.id]: {
              ...room.members[member.id],
              ...member,
            },
          },
        },
      };
    }),
  removeMember: (id) =>
    setState(({ room }) => {
      if (room === undefined) return { room };
      const members = { ...room.members };
      delete members[id];
      return {
        room: {
          ...room,
          members,
        },
      };
    }),
  leaveRoom: () => setState({ room: undefined }),
}));
