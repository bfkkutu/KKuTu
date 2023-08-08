import { Database } from "common/Database";

export enum MessageType {
  Error = "error",
}
export enum ErrorType {}
export interface C {
  type: MessageType;
}
export interface S {
  type: MessageType;
}
export interface Error {
  type: MessageType.Error;
  error: ErrorType;
}
export type CMessage = C;
export type SMessage = S | Error;
