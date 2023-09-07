import { create } from "zustand";

import { Database } from "../../common/Database";
import { Chat } from "front/@global/interfaces/Chat";
import { Game } from "common/Game";
import WebSocket from "front/@global/WebSocket";
import { ChatType } from "front/@global/enums/ChatType";

interface State {
  socket: WebSocket;
  initializeSocket: (url: string) => void;

  me: Database.DetailedUser;
  updateMe: (me: Database.DetailedUser) => void;

  community: Database.Community;
  updateCommunity: (community: Database.Community) => void;

  chatLog: Chat[];
  appendChat: (sender: string, content: string) => void;
  notice: (content: string) => void;

  users: Table<Database.SummarizedUser>;
  initializeUsers: (list: Database.SummarizedUser[]) => void;
  appendUser: (user: Database.SummarizedUser) => void;
  removeUser: (user: string) => void;

  rooms: Game.SummarizedRoom[];
  updateRoomList: (rooms: Game.SummarizedRoom[]) => void;
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

  community: { ...Database.community },
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

  rooms: [],
  updateRoomList: (rooms) => setState({ rooms }),
}));
