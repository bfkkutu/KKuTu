import { create } from "zustand";

import NotificationData from "front/@global/Bayadere/notification/NotificationData";

interface State {
  notifications: NotificationData[];
  show: (notification: NotificationData) => void;
  hide: (notification: NotificationData) => void;
}

export const useNotificationStore = create<State>((setState) => ({
  notifications: [],
  show: (notification) =>
    setState(({ notifications }) => ({
      notifications: [...notifications, notification],
    })),
  hide: (notification) =>
    setState(({ notifications }) => ({
      notifications: notifications.filter((v) => v !== notification),
    })),
}));
