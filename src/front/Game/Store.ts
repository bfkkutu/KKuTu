import { create } from "zustand";

import { Database } from "common/Database";
import { Room } from "common/Interfaces";
import { Chat } from "front/@global/interfaces/Chat";

interface State {
  socket: WebSocket;
  initializeSocket: (url: string) => WebSocket;

  me: Database.DetailedUser;
  updateMe: (me: Database.DetailedUser) => void;

  community: Database.Community;
  updateCommunity: (community: Database.Community) => void;

  chatLog: Chat[];
  appendChat: (chat: Chat) => void;

  users: Table<Database.SummarizedUser>;
  initializeUsers: (list: Database.SummarizedUser[]) => void;
  appendUser: (user: Database.SummarizedUser) => void;
  removeUser: (user: string) => void;

  room?: Room;
  rooms: Room[];
}

export const useStore = create<State>((setState) => ({
  socket: undefined as any,
  initializeSocket: (url: string) => {
    const socket = new WebSocket(url);
    setState({
      socket,
    });
    return socket;
  },

  me: undefined as any,
  updateMe: (me) =>
    setState({
      me,
    }),

  community: undefined as any,
  updateCommunity: (community) => setState({ community }),

  chatLog: [],
  appendChat: (chat) =>
    setState((state) => {
      const chatLog = [...state.chatLog, chat];
      if (chatLog.length > 100) chatLog.shift();
      return { chatLog };
    }),

  users: {},
  initializeUsers: (list) =>
    setState(() => {
      const users: Table<Database.SummarizedUser> = {};
      for (const item of list) users[item.id] = item;
      return { users };
    }),
  appendUser: (user) =>
    setState(({ users }) => ({
      users: {
        ...users,
        [user.id]: user,
      },
    })),
  removeUser: (user) =>
    setState((state) => {
      const users = { ...state.users };
      delete users[user];
      return { users };
    }),

  room: undefined,
  rooms: [],
}));
