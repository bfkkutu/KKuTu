import React from "react";
import { I18n } from "@daldalso/i18n";

import Icon from "front/@block/Icon";

export default I18n.register({
  home: <Icon type={Icon.Type.NORMAL} name="home" />,

  copyrightWordNet:
    "WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved.",
  copyrightKorean:
    "우리말샘 Copyright 2016 by 국립국어원. All rights reserved.",

  daldalso: "달달소",
  freeServerList: "서버 목록",

  total: "총",
  unitPeople: (v: number) => `${v}명`,
  unitSecond: (v: number, precision?: number) =>
    `${precision === undefined ? v : v.toFixed(precision)}초`,
  unitPercent: (v: number) => `${v}%`,

  render_failed: (
    <>
      <p>랜더링 중 오류가 발생했습니다.</p>
      <p>서비스 이용에 불편을 드려 죄송합니다.</p>
      <p>3초 후 재접속합니다.</p>
    </>
  ),
  TIME_DISTANCE_PAST: "<{HUMAN_M|{##0}}> 전",
  TIME_DISTANCE_FUTURE: "<{HUMAN_M|{##0}}> 후",

  login: "로그인",
  askLogout: "로그아웃 합니까?",
  serviceTerms: "서비스 이용 약관",
  privacyPolicy: "개인정보 처리방침",
  opensource: "오픈소스 고지",
  policy: "운영 정책",
  ok: "확인",
  cancel: "취소",
  yes: "예",
  no: "아니오",
  next: "다음",
  send: "전송",
  save: "저장",
  alert: "알림",
  confirm: "확인",
  optional: "(선택)",
  remove: "삭제",
  accept: "수락",
  decline: "거절",

  nickname: "닉네임",
  exordial: "소개말",

  theme: (id: string) => {
    switch (id) {
      case "0":
        return "";
      case "10":
        return "가톨릭";
      case "20":
        return "건설";
      case "30":
        return "경제";
      case "40":
        return "고적";
      case "50":
        return "고유";
      case "60":
        return "공업";
      case "70":
        return "광업";
      case "80":
        return "교육";
      case "90":
        return "교통";
      case "100":
        return "군사";
      case "110":
        return "기계";
      case "120":
        return "기독교";
      case "130":
        return "논리";
      case "140":
        return "농업";
      case "150":
        return "문학";
      case "160":
        return "물리";
      case "170":
        return "미술";
      case "180":
        return "민속";
      case "190":
        return "동물";
      case "200":
        return "법률";
      case "210":
        return "불교";
      case "220":
        return "사회";
      case "230":
        return "생물";
      case "240":
        return "수학";
      case "250":
        return "수산";
      case "260":
        return "수공";
      case "270":
        return "식물";
      case "280":
        return "심리";
      case "290":
        return "약학";
      case "300":
        return "언론";
      case "310":
        return "언어";
      case "320":
        return "역사";
      case "330":
        return "연영";
      case "340":
        return "예술";
      case "350":
        return "운동";
      case "360":
        return "음악";
      case "370":
        return "의학";
      case "380":
        return "인명";
      case "390":
        return "전기";
      case "400":
        return "정치";
      case "410":
        return "종교";
      case "420":
        return "지리";
      case "430":
        return "지명";
      case "440":
        return "책명";
      case "450":
        return "천문";
      case "460":
        return "철학";
      case "470":
        return "출판";
      case "480":
        return "통신";
      case "490":
        return "컴퓨터";
      case "500":
        return "한의학";
      case "510":
        return "항공";
      case "520":
        return "해양";
      case "530":
        return "화학";

      case "IMS":
        return "THE iDOLM@STER";
      case "VOC":
        return "보컬로이드/우타이테";
      case "KTV":
        return "국내 방송 프로그램";
      case "KOT":
        return "철도역";
      case "DOT":
        return "도타 2";
      case "DGM":
        return "디지몬";
      case "RAG":
        return "음식";
      case "LVL":
        return "러브 라이브!";
      case "LOL":
        return "리그 오브 레전드";
      case "MMM":
        return "마법소녀 마도카☆마기카";
      case "MAP":
        return "메이플스토리";
      case "MKK":
        return "메카쿠시티 액터즈";
      case "MNG":
        return "모노가타리 시리즈";
      case "MOB":
        return "모바일 게임";
      case "STA":
        return "스타크래프트";
      case "OIJ":
        return "신조어";
      case "ESB":
        return "앙상블 스타즈!";
      case "ELW":
        return "엘소드";
      case "OVW":
        return "오버워치";
      case "NEX":
        return "게임 이름";
      case "KPO":
        return "유명인";
      case "JLN":
        return "라이트 노벨";
      case "JAN":
        return "만화/애니메이션/웹툰";
      case "ZEL":
        return "젤다의 전설";
      case "POK":
        return "포켓몬스터";
      case "HAI":
        return "하이큐!!";
      case "HSS":
        return "하스스톤";
      case "KMV":
        return "영화 이름";
      case "HDC":
        return "함대 컬렉션";
      case "HOS":
        return "히어로즈 오브 더 스톰";
      case "DBD":
        return "데드바이데이라이트";
      case "RUN":
        return "런닝맨";
      case "MUN":
        return "대한민국 문화재";
      case "KPOP":
        return "한국 음악";
      case "SOK":
        return "속담";
      case "PKT":
        return "파워 쿵쿵따";
      case "PIC":
        return "명화";
      case "EMD":
        return "읍/면/동";
      case "MIN":
        return "마인크래프트";
      case "MINBE":
        return "마인크래프트 베드락 에디션";
      case "NYA":
        return "냥코대전쟁";
      case "CKR":
        return "쿠키런";
      case "HAK":
        return "학교";
      case "BUS":
        return "버스 정류장";
      case "BST":
        return "버스 터미널";
      case "DONG":
        return "동요";
      case "MFA":
        return "마피아42";
      case "ZHS":
        return "좀비고등학교";
      case "KTR":
        return "카트라이더";
      case "ILN":
        return "아이러브니키";
      case "TRR":
        return "테라리아";
      case "THP":
        return "동방 프로젝트";
      case "UND":
        return "언더테일/델타룬";
      case "TLR":
        return "테일즈런너";
      case "HKI":
        return "붕괴3rd";
      case "BAN":
        return "뱅드림! 걸즈 밴드 파티!";
      case "FGO":
        return "Fate/Grand/Order";
      case "YGO":
        return "유희왕";
      case "PCN":
        return "프린세스 커넥트! Re:Dive";
      case "WOW":
        return "월드 오브 워크래프트";
      case "SMW":
        return "서머너즈 워";
      case "CPR":
        return "기업";
      case "OPC":
        return "원피스";

      default:
        return id;
    }
  },

  ITEM_FROM: "재료 아이템",
  ITEM_TERM: "기간제 항목",
  ITEM_TERMED: "까지 사용 가능",

  OPTS_gEXP: "획득 경험치",
  OPTS_hEXP: "분당 추가 경험치",
  OPTS_gMNY: "획득 핑",
  OPTS_hMNY: "분당 추가 핑",
  OPTS_gRPT: "획득 랭크 포인트",
  OPTS_hRPT: "분당 추가 랭크 포인트",

  GROUP_PIX: "글자 조각",
  GROUP_CNS: "소모품",

  GROUP_NIK: "이름 스킨",
  GROUP_BDG1: "보물 휘장",
  GROUP_BDG2: "희귀 휘장",
  GROUP_BDG3: "고급 휘장",
  GROUP_BDG4: "일반 휘장",
  GROUP_Mhead: "모레미 머리",
  GROUP_Mheco: "머리 장식",
  GROUP_Meye: "모레미 눈",
  GROUP_Mmouth: "모레미 입",
  GROUP_Mhand: "모레미 손",
  GROUP_Mclothes: "모레미 옷",
  GROUP_Mshoes: "모레미 발",
  GROUP_Mback: "모레미 배경",
  GROUP_Mfront: "모레미 전경",

  server: (_: number) => "BF끄투",

  loading: "불러오는 중",

  error: (type: number) => {
    switch (type) {
      case 400:
        return "잘못된 요청이에요.";
      case 401:
        return "로그인이 필요합니다.";
      case 403:
        return "권한이 없어요.";
      case 404:
        return "대상을 찾을 수 없어요.";
      case 500:
        return "서버 오류가 발생했어요.";
    }
  },
  error_409_nickname: "중복되는 닉네임이 있습니다.",
});
