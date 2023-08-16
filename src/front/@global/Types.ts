export interface Chat {
  sender: string;
  content: string;
  receivedAt: Date;
}
export enum MenuType {
  Help = "help",
  Settings = "settings",
  Community = "community",
  Leaderboard = "leader",
  Spectate = "spectate",
  RoomSettings = "roomSettings",
  CreateRoom = "createRoom",
  Quick = "quick",
  Shop = "shop",
  Dictionary = "dict",
  Invite = "invite",
  Practice = "practice",
  Ready = "ready",
  Start = "start",
  Exit = "exit",
  Replay = "replay",
}
