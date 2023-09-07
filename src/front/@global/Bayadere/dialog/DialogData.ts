import React from "react";
import { create, UseBoundStore, StoreApi } from "zustand";

type OnHide = () => void;

interface Point {
  x: number;
  y: number;
  move: (movementX: number, movementY: number) => void;
}
export default class DialogData {
  public title: string | React.FC;
  public content: React.FC;
  public usePoint!: UseBoundStore<StoreApi<Point>>;
  public visible = false;
  /**
   * Clean up을 위한 함수.
   */
  public onHide?: OnHide;
  constructor(title: string | React.FC, content: React.FC, onHide?: OnHide) {
    this.title = title;
    this.content = content;
    this.onHide = onHide;
    this.initializeState();
  }
  public initializeState() {
    this.usePoint = create<Point>((setState) => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      move: (movementX, movementY) =>
        setState(({ x, y }) => ({
          x: x + movementX,
          y: y + movementY,
        })),
    }));
  }
}
