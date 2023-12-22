export interface Point {
  x: number;
  y: number;
  move: (movementX: number, movementY: number) => void;
}
