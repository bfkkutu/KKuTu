import React from "react";
import { create, UseBoundStore, StoreApi } from "zustand";

interface Point {
  x: number;
  y: number;
  move: (movementX: number, movementY: number) => void;
}
export default class DialogTuple {
  public title: string;
  public content: React.FC;
  public usePoint!: UseBoundStore<StoreApi<Point>>;
  public visible = false;
  constructor(title: string, content: React.FC) {
    this.title = title;
    this.content = content;
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
