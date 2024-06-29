import React from "react";
import { create } from "zustand";

import { Icon, IconType } from "front/@block/Icon";

export abstract class Notification {
  private static id = 0;
  /**
   * Notification은 생성 순서의 역순으로
   * 소멸한다는 보장이 없다.
   * 따라서 Notification마다 고유값을 부여한다.
   */
  public id = Notification.id++;

  public Component = React.memo(this.body.bind(this));

  protected abstract body(): React.ReactElement;

  public onClick(): void {}
}

export namespace Notification {
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
          <instance.Component />
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
          <Component key={notification.id} instance={notification} />
        ))}
      </div>
    );
  }
}
