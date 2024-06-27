import { Database } from "common/Database";
import { KKuTu } from "common/KKuTu";

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
    Start = "start",
    RoundStart = "roundStart",
    RoundEnd = "roundEnd",
    TurnStart = "turnStart",
    TurnError = "turnError",
    TurnEnd = "turnEnd",
    UpdateRoomList = "updateRoomList",
    /**
     * @sender Server & Client.
     * @condition 친구 요청 전송 시.
     */
    FriendRequest = "friendRequest",
    FriendRequestResponse = "friendRequestR",
    FriendRemove = "friendRemove",
    BlackListAdd = "blackListAdd",
    BlackListRemove = "blackListRemove",
    Whisper = "whisper",
    Report = "report",
    ReportChat = "reportChat",
    ReportWhisper = "reportWhisper",
    Invite = "invite",
    AddRobot = "addRobot",
    UpdateUser = "updateUser",
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
        me: Database.User;
        users: Database.User.Summarized[];
      };
      [Type.UpdateSettings]: {};
      [Type.UpdateCommunity]: {
        community: Database.JSON.Types.User.community;
      };
      [Type.Join]: {
        user: Database.User.Summarized;
      };
      [Type.Leave]: {
        /**
         * 접속을 종료한 유저 식별자
         */
        user: string;
      };
      [Type.Chat]: Database.Chat;
      [Type.CreateRoom]: {
        room: KKuTu.Room.Detailed;
      };
      [Type.UpdateRoom]: {
        room: KKuTu.Room.Detailed;
      };
      [Type.HandoverRoom]: {};
      [Type.InitializeRoom]: {
        room: KKuTu.Room.Detailed;
      };
      [Type.JoinRoom]: {
        member: KKuTu.Room.Member;
      };
      [Type.LeaveRoom]: {
        /**
         * 방을 나간 member 식별자
         */
        member: string;
      };
      [Type.Spectate]: {
        member: KKuTu.Room.Member;
      };
      [Type.Ready]: {
        member: KKuTu.Room.Member;
      };
      [Type.Start]: {
        game: KKuTu.Game;
      };
      [Type.RoundStart]: {
        /**
         * 현재 라운드.
         */
        round: number;
      };
      [Type.RoundEnd]: {
        /**
         * 점수 손실.
         */
        loss: number;
      };
      [Type.TurnStart]: {
        display: string;
        player: string;
        speed: number;
        time: number;
      };
      [Type.TurnError]: {
        errorType: string;
      };
      [Type.TurnEnd]: {
        word: Database.Word;
      };
      [Type.UpdateRoomList]: {
        rooms: KKuTu.Room.Summarized[];
      };
      [Type.FriendRequest]: {};
      [Type.FriendRequestResponse]: {};
      [Type.FriendRemove]: {};
      [Type.BlackListAdd]: {};
      [Type.BlackListRemove]: {};
      [Type.Whisper]: Database.Whisper;
      [Type.Report]: {};
      [Type.ReportChat]: {};
      [Type.ReportWhisper]: {};
      [Type.Invite]: {
        /**
         * 초대를 보낸 유저 식별자.
         */
        user: string;
        /**
         * 방 식별자.
         */
        room: number;
      };
      [Type.AddRobot]: {};
      [Type.UpdateUser]: {
        user: Database.User.Summarized;
      };
      [Type.QueryUser]: {
        user?: Database.User.Summarized;
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
        room: KKuTu.Room.Settings;
      };
      [Type.UpdateRoom]: {
        room: KKuTu.Room.Settings;
      };
      [Type.HandoverRoom]: {
        master: string;
      };
      [Type.InitializeRoom]: {};
      [Type.JoinRoom]: {
        target: number;
        password?: string;
      };
      [Type.LeaveRoom]: {};
      [Type.Spectate]: {};
      [Type.Ready]: {};
      [Type.Start]: {};
      [Type.RoundStart]: {};
      [Type.RoundEnd]: {};
      [Type.TurnStart]: {};
      [Type.TurnError]: {};
      [Type.TurnEnd]: {};
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
      [Type.FriendRemove]: {
        target: string;
      };
      [Type.BlackListAdd]: {
        target: string;
      };
      [Type.BlackListRemove]: {
        target: string;
      };
      [Type.Whisper]: {
        target: string;
        content: string;
      };
      [Type.Report]: {
        /**
         * 신고 대상 유저의 식별자
         */
        target: string;
        reason: number;
        comment: string;
      };
      [Type.ReportChat]: {
        /**
         * 신고 대상 Chat 객체의 식별자
         */
        target: string;
      };
      [Type.ReportWhisper]: {
        /**
         * 신고 대상 Whisper 객체의 식별자
         */
        target: string;
      };
      [Type.Invite]: {
        target: string;
      };
      [Type.AddRobot]: {};
      [Type.UpdateUser]: {};
      [Type.QueryUser]: {
        target: string;
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
     */
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    /**
     * @reason 세션이 만료되었을 때 발생한다.
     */
    Conflict = 409,
  }

  export interface Content {
    [Type.BadRequest]: {};
    [Type.Unauthorized]: {};
    [Type.Forbidden]: {};
    [Type.NotFound]: {};
    [Type.Conflict]: {};
  }

  export type ContentWithFlags = {
    [type in keyof Content]: {
      isFatal: boolean;
    } & Content[type];
  };

  // 오류는 서버만 보낸다.
  export type Message = {
    [type in keyof Content]: {
      errorType: type;
    } & ContentWithFlags[type];
  };
}
