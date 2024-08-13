import { I18n } from "@daldalso/i18n";

export default I18n.register({
  title: "BF끄투 - 로그인",

  loginWith: "로그인 방법을 선택하세요.",

  with: (type: string) => {
    switch (type) {
      case "naver":
        return "네이버 아이디로 로그인";
      case "google":
        return "구글 계정으로 로그인";
      case "kakao":
        return "카카오 계정으로 로그인";
      case "discord":
        return "디스코드 계정으로 로그인";
      case "daldalso":
        return "달달소 송수신체로 연결";
    }
  },

  login_kkutu: "BF끄투를 이용하시려면 로그인을 해 주세요.",
});
