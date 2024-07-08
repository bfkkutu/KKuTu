export namespace Display {
  export enum Type {
    None = "",
    Short = "short",
    Long = "long",
    Error = "error",
    Timeout = "timeout",
  }

  export const BEAT: Record<number, number> = {
    [1]: 0b0000_0001,
    [2]: 0b0001_0001,
    [3]: 0b0100_1001,
    [4]: 0b0101_1001,
    [5]: 0b0101_1011,
    [6]: 0b0111_1011,
    [7]: 0b1111_1011,
    [8]: 0b1111_1111,
  };
}
export interface Display {
  type: Display.Type;
  content: string;
  isAnimating: boolean;
  submitting?: number;
}
