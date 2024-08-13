import React from "react";
import { josa } from "josa";
import { I18n } from "@daldalso/i18n";

import Icon from "front/@block/Icon";
import { KKuTu } from "../../../../common/KKuTu";

export default I18n.register({
  title: "BF끄투",

  welcome: "환영합니다.",
  connecting: "채널과 연결하는 중...",
  loading_resource: (id: string) => `리소스를 불러오는 중: ${id}`,

  error_closed: (type: number) => `[#${type}] 서버와 연결이 끊어졌어요.`,
  error_soundNotFound: (id: string) =>
    josa(`소리 리소스 ${id}#{을} 로드하지 못했어요.`),
  error_noResult: "검색 결과가 없어요.",
  error_startNotReady: "모든 참가자가 준비해야 시작할 수 있어요.",
  error_startAlone: "혼자서는 게임을 시작할 수 없어요.",
  error_roomNotFound: "방을 찾을 수 없어요.",
  error_roomFull: "방이 이미 꽉 찼어요.",
  error_roomNewbie: "이 방에서는 30레벨을 넘는 유저의 참여를 제한하고 있어요.",
  error_roomInvalid: "방 구성이 잘못되었어요.",
  error_passwordMismatch: "잘못된 비밀번호예요.",
  error_friendRequestAlreadyInBlackList:
    "블랙리스트에 있는 유저에게는 친구 추가 요청을 보낼 수 없어요.",
  error_blackListAlreadyFriend: "친구는 블랙리스트에 추가할 수 없어요.",
  error_alreadyReportedMessage: "이미 신고한 메시지에요.",
  error_unknown: "알 수 없는 오류가 발생했어요.",

  turnError: (type: string, display: string) => {
    switch (type) {
      case "inHistory":
        return `이미 쓰인 단어: ${display}`;
      case "manner":
        return `한 방 단어: ${display}`;
      default:
        return display;
    }
  },

  error_409: "세션이 만료되었어요. 다시 로그인해주세요.",

  icon_hide: <Icon type={Icon.Type.NORMAL} name="eye" />,
  icon_show: <Icon type={Icon.Type.NORMAL} name="eye-slash" />,
  icon_report: <Icon type={Icon.Type.NORMAL} name="flag" />,

  unitLevel: (v: number) => `레벨 ${v}`,
  unitRound: (v: number) => `라운드 ${v}`,
  unitScore: (v: number) => `${v}점`,
  unitScoreWithCommas: (v: number) => `${v.toLocaleString()}점`,

  search: "검색",
  invite: "초대",
  follow: "따라가기",
  change: "변경",
  whisper: "1대1 채팅",
  friendRequest: "친구 추가",
  blackListAdd: "블랙리스트 추가",
  open: "열기",
  level: "레벨",
  report: "신고",
  submit: "제출",
  handover: "방장 인계",
  kick: "추방",
  createRoom: "방 만들기",
  roomTitle: "방 제목",
  roomPolicy: "정책",
  roomLimit: "플레이어 수",
  roomMode: "게임 유형",
  roomRound: "라운드 수",
  roomRoundTime: "라운드 시간",
  roomRules: "특수 규칙",
  roomSettings: "방 설정",
  themeSelect: "주제 선택",
  ready: "준비",
  spectator: "관전",
  master: "방장",
  robot: "끄투 봇",

  autoReady: "자동 준비",
  badWordsFilter: "비속어 필터링",

  moveServer: "채널 변경",

  bgm_lobby: (id: number) => {
    switch (id) {
      case 1:
        return "HexaCube - Breakdown Fragment";
      case 2:
        return "라크다르 - 새로운 시작";
      case 3:
        return "BF끄투 (Piano)";
      case 4:
        return "끄투";
    }
  },

  room_policy_newbie: "초보 전용",
  room_policy_newbie_desc: "30레벨을 넘는 유저의 참여를 금지해요.",
  room_policy_joinWhileGaming: "게임 중 참여",
  room_policy_joinWhileGaming_desc: (
    <>
      <p>게임 도중 입장하면 관전자가 되지 않고</p>
      <p>게임에 바로 참여해요.</p>
    </>
  ),

  game_mode: (mode: KKuTu.Game.Mode) => {
    switch (mode) {
      case KKuTu.Game.Mode.KoreanRelay:
        return "한국어 끝말잇기";
      case KKuTu.Game.Mode.KoreanRelayReversed:
        return "한국어 앞말잇기";
      case KKuTu.Game.Mode.KoreanThree:
        return "한국어 쿵쿵따";
      case KKuTu.Game.Mode.KoreanKKuTu:
        return "한국어 끄투";
      case KKuTu.Game.Mode.KoreanConsonantQuiz:
        return "한국어 자음퀴즈";
      case KKuTu.Game.Mode.KoreanTypingCompetition:
        return "한국어 타자대결";
      case KKuTu.Game.Mode.KoreanWordCompetition:
        return "한국어 단어대결";
      case KKuTu.Game.Mode.KoreanSock:
        return "한국어 솎솎";
      case KKuTu.Game.Mode.KoreanDrawingQuiz:
        return "한국어 그림퀴즈";

      case KKuTu.Game.Mode.EnglishRelay:
        return "영어 끝말잇기";
      case KKuTu.Game.Mode.EnglishKKuTu:
        return "영어 끄투";
      case KKuTu.Game.Mode.EnglishTypingCompetition:
        return "영어 타자대결";
      case KKuTu.Game.Mode.EnglishWordCompetition:
        return "영어 단어대결";
      case KKuTu.Game.Mode.EnglishSock:
        return "영어 솎솎";
      case KKuTu.Game.Mode.EnglishDrawingQuiz:
        return "영어 그림퀴즈";

      case KKuTu.Game.Mode.Hunmin:
        return "훈민정음";
    }
  },

  game_rule: (rule: KKuTu.Game.Rule) => {
    switch (rule) {
      case KKuTu.Game.Rule.Manner:
        return "매너";
      case KKuTu.Game.Rule.Wide:
        return "어인정";
      case KKuTu.Game.Rule.Mission:
        return "미션";
      case KKuTu.Game.Rule.Proverb:
        return "속담";
      case KKuTu.Game.Rule.Unlimited:
        return "무제한";
      case KKuTu.Game.Rule.Short:
        return "짧은 단어";
      case KKuTu.Game.Rule.NoInitial:
        return "두음 법칙 없음";
      case KKuTu.Game.Rule.Dismission:
        return "글자 금지";
      case KKuTu.Game.Rule.Item:
        return "아이템전";
      case KKuTu.Game.Rule.BanDouble:
        return "두 글자 금지";
    }
  },
  game_rule_desc: (rule: KKuTu.Game.Rule) => {
    switch (rule) {
      case KKuTu.Game.Rule.Manner:
        return "한방 단어 사용을 금지해요.";
      case KKuTu.Game.Rule.Wide:
        return "특수한 단어의 사용을 인정해요.";
      case KKuTu.Game.Rule.Mission:
        return "특정 글자를 포함한 단어로 이으면 추가 점수를 얻어요.";
      case KKuTu.Game.Rule.Proverb:
        return "화면에 낱말 대신 한 문장씩 나타나요.";
      case KKuTu.Game.Rule.Unlimited:
        return "제시어의 길이 제한을 없애요.";
      case KKuTu.Game.Rule.Short:
        return "";
      case KKuTu.Game.Rule.NoInitial:
        return "두음 법칙을 적용하지 않아요.";
      case KKuTu.Game.Rule.Dismission:
        return "특정 글자를 포함한 단어로 이을 수 없어요.";
      case KKuTu.Game.Rule.Item:
        return "아이템을 활성화해요.";
      case KKuTu.Game.Rule.BanDouble:
        return "두 글자 단어를 사용할 수 없게 해요.";
    }
  },

  game_input_placeholder: "당신의 차례! 아래의 채팅 창에서 입력하세요.",

  menu_spectate: "관전하기",
  menu_roomSettings: "방 설정",
  menu_searchRoom: "방 검색",
  menu_shop: "상점",
  menu_dict: "사전",
  menu_invite: "초대",
  menu_practice: "연습",
  menu_ready: "준비",
  menu_start: "시작",
  menu_leave: "나가기",
  menu_replay: "전적",

  settings_title: withIcon("wrench", "환경 설정"),
  settings_bgmVolume: "배경 음악 크기",
  settings_effectVolume: "효과음 크기",
  settings_bgm: "배경 음악 선택",
  settings_locale: "언어(Language)",
  settings_refuse: "자동 거절",
  settings_game: "게임",
  settings_filterProfanities: "욕설 필터링",
  settings_etc: "기타",
  settings_alert_saved: "변경 사항이 저장되었어요.",

  result_title: "게임 결과",
  result_score: "획득한 경험치",
  result_money: "획득한 핑",
  result_save: "경기 저장",

  community_title: (v: number) => withIcon("users", `친구 (${v} / 100)`),

  blackList_title: withIcon("ban", "블랙리스트 관리"),

  roomSettings_title_default: (nickname: string) => `${nickname}님의 방`,
  roomSettings_password: "비밀번호",

  themeSelect_common: "일반",
  themeSelect_wide: "어인정",

  dictionary_title: withIcon("book", "사전"),
  dictionary_input: "검색어",
  dictionary_input_placeholder: "검색어를 입력하세요.",
  dictionary_notFound: "검색 결과가 없어요.",

  profile_title: (nickname: string) => withIcon("user", `${nickname}님의 정보`),

  whisper_title: (nickname: string) =>
    withIcon("comment", `${nickname}님과의 1대1 채팅`),

  invite_title: withIcon("envelope", "초대"),
  invite_robot: "로봇 추가",

  report_title: (nickname: string) => withIcon("flag", `신고 - ${nickname}`),
  report_target: "대상",
  report_reason: (reason?: number) => {
    if (reason === undefined) {
      return "사유";
    }
    switch (reason) {
      case 0:
        return "욕설 및 비속어 사용";
      case 1:
        return "어뷰징 등 비매너 플레이";
      case 2:
        return "비인가 프로그램 사용";
      case 3:
        return "다른 이용자에게 불쾌감을 주는 행위";
    }
  },

  userListBox_title: (server: string, users: number) => (
    <>
      <Icon type={Icon.Type.NORMAL} name="users" /> {"<"}
      <b>{server}</b>
      {">"} 접속자 목록 [{users}명]
    </>
  ),
  roomListBox_title: (v: number) => withIcon("bars", `방 목록 [${v}개]`),
  searchRoomBox_title: withIcon("bars", "방 검색"),
  chatBox_title: withIcon("comment", "채팅"),
  profileBox_title: withIcon("user", "내 정보"),

  stat_record: (v: number) => `통산 ${v}승`,
  stat_money: (v: number) => `${v}핑`,
  stat_roomLimit: (v: number, limit: number) => `참여자 ${v} / ${limit}`,

  alert_botdFailed: "클라이언트 문제로 서버와 연결하지 못했어요.",
  alert_botdDetected: (
    <>
      <p>비인가 프로그램을 감지했습니다.</p>
      <p>서버와 연결을 종료합니다.</p>
    </>
  ),
  alert_friendRequest: (nickname: string) =>
    `${nickname}님께 친구 추가 요청을 보냈어요.`,
  alert_kicked: "방에서 추방되었어요.",
  alert_localeChanged: "언어 변경 사항은 재접속 시 적용돼요.",
  alert_friendRemove: (nickname: string) =>
    `${nickname}님을 친구 목록에서 삭제했어요.`,
  alert_blackListAdd: (nickname: string) =>
    `${nickname}님을 블랙리스트에 추가했어요.`,
  alert_blackListRemove: (nickname: string) =>
    `${nickname}님을 블랙리스트에서 삭제했어요.`,
  alert_invite: (nickname: string) => `${nickname}님을 초대했어요.`,
  alert_reportSubmitted: "신고가 제출되었어요.",

  confirm_friendRequest: (nickname: string) =>
    `${nickname}님께 친구 추가 요청을 보낼까요?`,
  confirm_handover: (nickname: string) => `${nickname}님께 방장을 인계할까요?`,
  confirm_kick: (nickname: string) => `${nickname}님을 추방할까요?`,
  confirm_invite: (nickname: string) => `${nickname}님을 초대할까요?`,
  confirm_leave: (
    <>
      <p>지금 나가면 경험치와 핑을 얻을 수 없어요.</p>
      <p>정말 방에서 나갈까요?</p>
    </>
  ),
  confirm_follow: (nickname: string, room: number) =>
    `${nickname}님이 있는 ${room}번 방으로 이동할까요?`,
  confirm_inviteResponse: (nickname: string, room: number) => (
    <>
      <p>
        {nickname}님으로부터 {room}번 방의 초대를 받았습니다.
      </p>
      <p>수락하시겠습니까?</p>
    </>
  ),
  confirm_friendRemove: (nickname: string) =>
    `${nickname}님을 친구 목록에서 삭제할까요?`,
  confirm_blackListAdd: (nickname: string) => (
    <>
      <p>{nickname}님을 블랙리스트에 추가할까요?</p>
      <p>블랙리스트에 추가한 유저의 채팅은 자동 숨김 처리되고</p>
      <p>해당 유저로부터 1대1 채팅과 초대 요청을 받을 수 없어요.</p>
      <p>또한 해당 유저가 접속자 목록에 나타나지 않아요.</p>
    </>
  ),
  confirm_blackListRemove: (nickname: string) =>
    `${nickname}님을 블랙리스트에서 삭제할까요?`,
  confirm_reportMessage: "이 메시지를 신고할까요?",

  prompt_title_roomPassword: withIcon("key", "방 비밀번호"),
  prompt_roomPassword: "비밀번호를 입력하세요.",
  prompt_title_changePassword: withIcon("key", "방 비밀번호 변경"),
  prompt_changePassword: (
    <>
      <p>새 방 비밀번호를 입력하세요.</p>
      <p>방 설정을 저장하면 반영돼요.</p>
    </>
  ),

  notice_chatInvisible: "숨긴 채팅입니다.",
  notice_joinRoom: (nickname: string) => `${nickname}님이 입장했어요.`,
  notice_leaveRoom: (nickname: string) => `${nickname}님이 퇴장했어요.`,
  notice_handover: (nickname: string) => `${nickname}님으로 방장이 바뀌었어요.`,

  notification_whisper: (nickname: string, count: number) =>
    `${nickname}님의 새 메시지 ${count}개`,
  notification_invite: (room: number) => `${room}번 방에서 초대`,

  underDevelopment: "준비 중입니다.",
});

function withIcon(icon: string, title: string) {
  return (
    <>
      <Icon type={Icon.Type.NORMAL} name={icon} /> {title}
    </>
  );
}
