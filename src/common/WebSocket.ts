import { Database } from "common/Database";
import { Game } from "common/Game";

export namespace WebSocketMessage {
  export enum Type {
    /**
     * @sender Server.
     * @condition 채널 접속 시.
     *
     * 현재 채널의 유저 정보, 방 정보, 캐릭터 정보 등을 클라이언트에 제공한다.
     */
    Initialize = "initialize",
    UpdateSettings = "updateSettings",
    /**
     * @sender Server.
     * @condition 현재 클라이언트와 관련된 커뮤니티 데이터에 변경 사항이 생겼을 때.
     */
    UpdateCommunity = "updateCommunity",
    /**
     * @sender Server.
     * @condition 다른 유저 접속 시.
     *
     * 새로 접속한 유저 정보를 기존에 접속 중이던 클라이언트들에게 제공한다.
     */
    Join = "join",
    /**
     * @sender Server.
     * @condition 다른 유저 접속 종료 시.
     *
     * 접속을 종료한 유저 id를 클라이언트에 제공한다.
     */
    Leave = "leave",
    /**
     * @sender Server & Client.
     * @condition 누군가 채팅 전송 시.
     */
    Chat = "chat",
    CreateRoom = "createRoom",
    UpdateRoom = "updateRoom",
    HandoverRoom = "handoverRoom",
    InitializeRoom = "initializeRoom",
    JoinRoom = "joinRoom",
    LeaveRoom = "leaveRoom",
    Spectate = "spectate",
    Ready = "ready",
    UpdateRoomList = "updateRoomList",
    /**
     * @sender Server & Client.
     * @condition 친구 요청 전송 시.
     */
    FriendRequest = "friendRequest",
    FriendRequestResponse = "friendRequestR",
    /**
     * @sender Client.
     * @condition 접속 중이 아닌 유저의 정보가 필요한 경우.
     */
    QueryUser = "queryUser",

    Heartbeat = "heartbeat",
    Error = "error",
  }

  export namespace Content {
    /**
     * 서버가 보내는 메시지.
     */
    export interface Server {
      [Type.Initialize]: {
        me: Database.DetailedUser;
        users: Database.SummarizedUser[];
      };
      [Type.UpdateSettings]: {};
      [Type.UpdateCommunity]: {
        community: Database.Community;
      };
      [Type.Join]: {
        user: Database.SummarizedUser;
      };
      [Type.Leave]: {
        userId: string;
      };
      [Type.Chat]: {
        /**
         * 채팅을 보낸 유저의 식별자.
         */
        sender: string;
        /**
         * 채팅 내용.
         */
        content: string;
      };
      [Type.CreateRoom]: {
        room: Game.DetailedRoom;
      };
      [Type.UpdateRoom]: {
        room: Game.DetailedRoom;
      };
      [Type.HandoverRoom]: {
        master: string;
      };
      [Type.InitializeRoom]: {
        room: Game.DetailedRoom;
      };
      [Type.JoinRoom]: {
        member: Game.RoomMember;
      };
      [Type.LeaveRoom]: {
        memberId: string;
      };
      [Type.Spectate]: {
        member: Game.RoomMember;
      };
      [Type.Ready]: {
        member: Game.RoomMember;
      };
      [Type.UpdateRoomList]: {
        rooms: Game.SummarizedRoom[];
      };
      [Type.FriendRequest]: {};
      [Type.FriendRequestResponse]: {};
      [Type.QueryUser]: {
        user?: Database.SummarizedUser;
      };

      [Type.Heartbeat]: {};
      [Type.Error]: WebSocketError.Message[keyof WebSocketError.Content];
    }
    /**
     * 클라이언트가 보내는 메시지.
     */
    export interface Client {
      [Type.Initialize]: {};
      [Type.UpdateSettings]: {
        settings: Database.JSON.Types.User.settings;
      };
      [Type.UpdateCommunity]: {}; // dummy
      [Type.Join]: {}; // dummy
      [Type.Leave]: {}; // dummy
      [Type.Chat]: {
        /**
         * 채팅 내용.
         */
        content: string;
      };
      [Type.CreateRoom]: {
        room: Game.RoomSettings;
      };
      [Type.UpdateRoom]: {
        room: Game.RoomSettings;
      };
      [Type.HandoverRoom]: {
        master: string;
      };
      [Type.InitializeRoom]: {};
      [Type.JoinRoom]: {
        roomId: number;
      };
      [Type.LeaveRoom]: {};
      [Type.Spectate]: {};
      [Type.Ready]: {};
      [Type.UpdateRoomList]: {};
      [Type.FriendRequest]: {
        /**
         * 친구 요청 대상의 식별자.
         */
        target: string;
      };
      [Type.FriendRequestResponse]: {
        sender: string;
        /**
         * 친구 요청 수락 여부.
         */
        accept: boolean;
      };
      [Type.QueryUser]: {
        userId: string;
      };

      [Type.Heartbeat]: {};
      [Type.Error]: {}; // dummy
    }
  }

  export type Server = {
    [type in keyof Content.Server]: { type: type } & Content.Server[type];
  };
  export type Client = {
    [type in keyof Content.Client]: { type: type } & Content.Client[type];
  };
}

export namespace WebSocketError {
  export enum Type {
    BadRequest = 400,
    /**
     * @reason 게임 채널에 로그인하지 않은 채로 접속하려고 시도하면 발생한다.
     * @action 소켓을 닫는다.
     */
    Unauthorized = 401,
    Forbidden = 403,
  }

  export interface Content {
    [Type.BadRequest]: {};
    [Type.Unauthorized]: {};
    [Type.Forbidden]: {};
  }

  // 오류는 서버만 보낸다.
  export type Message = {
    [type in keyof Content]: {
      errorType: type;
    } & Content[type];
  };
}
