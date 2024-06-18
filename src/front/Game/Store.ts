import { create } from "zustand";

import WebSocket from "front/@global/WebSocket";
import { ChatType } from "front/@global/enums/ChatType";
import { Database } from "../../common/Database";
import { Chat } from "common/interfaces/Chat";
import { KKuTu } from "common/KKuTu";

interface State {
  socket: WebSocket;
  initializeSocket: (url: string) => void;

  me: Database.User;
  updateMe: (me: Database.User) => void;

  community: Database.JSON.Types.User.community;
  updateCommunity: (community: Database.JSON.Types.User.community) => void;

  chatLog: Chat[];
  appendChat: (sender: string, content: string) => void;
  notice: (content: string) => void;

  users: Table<Database.User.Summarized>;
  initializeUsers: (list: Database.User.Summarized[]) => void;
  appendUser: (user: Database.User.Summarized) => void;
  setUser: (id: string, user: Partial<Database.User.Summarized>) => void;
  removeUser: (user: string) => void;

  rooms: KKuTu.Room.Summarized[];
  updateRoomList: (rooms: KKuTu.Room.Summarized[]) => void;
}

export const useStore = create<State>((setState) => ({
  socket: undefined as any,
  initializeSocket: (url: string) =>
    setState({
      socket: new WebSocket(url),
    }),

  me: undefined as any,
  updateMe: (me) =>
    setState({
      me,
    }),

  community: { ...Database.JSON.Defaults.User.community },
  updateCommunity: (community) => setState({ community }),

  chatLog: [],
  appendChat: (sender, content) =>
    setState((state) => {
      const chatLog = [
        ...state.chatLog,
        {
          type: ChatType.Chat,
          sender,
          content,
          receivedAt: new Date(),
        },
      ];
      if (chatLog.length > 100) chatLog.shift();
      return { chatLog };
    }),
  notice: (content) =>
    setState((state) => {
      const chatLog = [
        ...state.chatLog,
        {
          type: ChatType.Notice,
          sender: "",
          content,
          receivedAt: new Date(),
        },
      ];
      if (chatLog.length > 100) chatLog.shift();
      return { chatLog };
    }),

  users: {},
  initializeUsers: (list) =>
    setState(() => {
      const users: Table<Database.User.Summarized> = {};
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
  setUser: (id, user) =>
    setState(({ users }) => ({
      users: { ...users, [id]: { ...users[id], ...user } },
    })),
  removeUser: (user) =>
    setState((state) => {
      const users = { ...state.users };
      delete users[user];
      return { users };
    }),

  rooms: [],
  updateRoomList: (rooms) => setState({ rooms }),
}));
