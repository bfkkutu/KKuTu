import React from "react";
import { create } from "zustand";

import { Icon, IconType } from "front/@block/Icon";
import { renderComponentOrNode } from "front/@global/Utility";

export class Notification {
  public content: React.ComponentOrNode;
  public onClick?: Notification.OnClick;

  constructor(content: React.ComponentOrNode, onClick?: Notification.OnClick) {
    this.content = content;
    this.onClick = onClick;
  }
}

export namespace Notification {
  export type OnClick = () => void;

  interface State {
    notifications: Notification[];
    show: (notification: Notification) => void;
    hide: (notification: Notification) => void;
  }

  export const useStore = create<State>((setState) => ({
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

  interface Props {
    instance: Notification;
  }
  function Component({ instance }: Props) {
    const hide = useStore((state) => state.hide);

    return (
      <div className="notification">
        <div
          className="body"
          onClick={() => {
            instance.onClick?.();
            hide(instance);
          }}
        >
          {renderComponentOrNode(instance.content)}
        </div>
        <div className="close" onClick={() => hide(instance)}>
          <Icon type={IconType.NORMAL} name="xmark" />
        </div>
      </div>
    );
  }

  export function Manager() {
    const notifications = useStore((state) => state.notifications);

    return (
      <div id="notification">
        {notifications.map((notification) => (
          <Component instance={notification} />
        ))}
      </div>
    );
  }
}
