import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Database } from "common/Database";
import { Room } from "common/Interfaces";
import { Chat } from "front/@global/Interfaces";

interface State {
  loading: boolean;

  socket: WebSocket;
  initializeSocket: (url: string) => WebSocket;

  me?: Database.DetailedUser;
  updateMe: (me: Database.DetailedUser) => void;

  chatLog: Chat[];
  appendChat: (chat: Chat) => void;

  users: Table<Database.SummarizedUser>;
  initializeUsers: (list: Database.SummarizedUser[]) => void;
  addUser: (user: Database.SummarizedUser) => void;
  removeUser: (user: Database.SummarizedUser) => void;

  room?: Room;
  rooms: Room[];
}

export const useStore = create<State>()(
  subscribeWithSelector((setState) => ({
    loading: false,

    socket: undefined as any,
    initializeSocket: (url: string) => {
      const socket = new WebSocket(url);
      setState({
        socket,
      });
      return socket;
    },

    me: undefined,
    updateMe: (me: Database.DetailedUser) =>
      setState({
        me,
      }),

    chatLog: [],
    appendChat: (chat: Chat) =>
      setState((state) => {
        const chatLog = [...state.chatLog, chat];
        if (chatLog.length > 100) chatLog.shift();
        return { chatLog };
      }),

    users: {},
    initializeUsers: (list: Database.SummarizedUser[]) =>
      setState(() => {
        const users: Table<Database.SummarizedUser> = {};
        for (const item of list) users[item.id] = item;
        return { users };
      }),
    addUser: (user: Database.SummarizedUser) =>
      setState(({ users }) => ({
        users: {
          ...users,
          [user.id]: user,
        },
      })),
    removeUser: (user: Database.SummarizedUser) =>
      setState((state) => {
        const users = { ...state.users };
        delete users[user.id];
        return { users };
      }),

    room: undefined,
    rooms: [],
  }))
);
