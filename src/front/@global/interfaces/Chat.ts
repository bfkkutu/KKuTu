import { ChatType } from "front/@global/enums/ChatType";

export interface Chat {
  type: ChatType;
  sender: string;
  content: string;
  receivedAt: Date;
}
