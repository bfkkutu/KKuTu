import React from "react";
import { josa } from "josa";
import { I18n } from "@daldalso/i18n";

import Icon from "front/@block/Icon";
import API from "../../../../common/API";
import { KKuTu } from "../../../../common/KKuTu";
import { Database } from "../../../../common/Database";

export default I18n.register({
  title: "BF끄투 - 관리 도구",
  welcome: "BF끄투 관리 도구입니다.",

  icon_remove: <Icon type={Icon.Type.NORMAL} name="xmark" />,

  language: (language?: KKuTu.Game.Language) => {
    if (language === undefined) {
      return "데이터베이스(언어)";
    }
    switch (language) {
      case KKuTu.Game.Language.Korean:
        return "한국어";
      case KKuTu.Game.Language.English:
        return "영어";
    }
  },
  queryType: (type: API.QueryType) => {
    switch (type) {
      case API.QueryType.Exact:
        return "와(과) 일치하는";
      case API.QueryType.Includes:
        return "을(를) 포함하는";
      case API.QueryType.StartsWith:
        return "(으)로 시작하는";
      case API.QueryType.EndsWith:
        return "(으)로 끝나는";
    }
  },
  query: "조회",

  alert_save: (
    <>
      <p>라이브 서버에 변경 사항이 적용돼요.</p>
      <p>계속할까요?</p>
    </>
  ),
  alert_saved: "작업을 완료했어요.",

  // TODO: implement detailed error messages

  themePrompt_title: "주제 선택",
  themePrompt_body: "주제를 선택하세요.",

  departure: (departure: Database.Departure) => {
    switch (departure) {
      case Database.Departure.None:
        return "메인 화면";
      case Database.Departure.Owner:
        return "인사";
      case Database.Departure.Management:
        return "유저 관리";
      case Database.Departure.DatabaseWord:
        return "단어 데이터베이스";
      case Database.Departure.DatabaseShop:
        return "상점 데이터베이스";
    }
  },

  departure1_menu0: "권한 설정",

  departure2_menu0: "신고 기록 조회",

  departure4_word: "단어",
  departure4_theme: "주제",
  departure4_mean: "뜻",
  departure4_noTheme: "(주제 없음)",
  departure4_desc_language: "조작할 데이터베이스를 선택해주세요.",
  departure4_wordEditor_errorThemeAlreadyExist: (
    <>
      <p>주제는 중복해서 추가할 수 없어요.</p>
      <p>대신 뜻 추가 버튼을 눌러 뜻을 더 추가해보세요.</p>
    </>
  ),
  departure4_wordEditor_errorThemeShouldExist:
    "주제를 최소한 하나는 추가해야 해요.",
  departure4_wordEditor_meanPlaceholder: "뜻을 입력하세요.",
  departure4_wordEditor_addTheme: "주제 추가",
  departure4_wordEditor_addMean: "뜻 추가",
  departure4_menu0: "추가",
  departure4_menu0_title_direct: "직접 추가하기",
  departure4_menu0_desc_direct: (
    <>
      <p>※ 한 번에 하나의 단어만 추가할 수 있어요.</p>
      <p>(단, 하나의 단어에 대해 주제와 뜻을 여러 개 입력할 수는 있어요)</p>
      <p>
        ※ 같은 단어가 데이터베이스에 존재하는 경우 조회 & 수정 탭을 이용하세요.
      </p>
    </>
  ),
  departure4_menu0_direct_wordPlaceholder: "추가할 단어를 입력하세요.",
  departure4_menu0_direct_remove: <Icon type={Icon.Type.NORMAL} name="xmark" />,
  departure4_menu0_title_fromList: "목록으로 추가하기",
  departure4_menu0_desc_fromList: (
    <>
      <p>
        ※ 하나의 공통된 주제를 가진 여러 개의 단어를 한 번에 추가할 수 있어요.
      </p>
      <p>
        ※ 같은 단어가 데이터베이스에 존재하는 경우 해당 단어에 대해서는 주제만
        새로 추가해요.
      </p>
      <p>
        ※ 뜻을 추가해야 하는 경우 단어 추가 후 조회 & 수정 탭에서 뜻을
        추가하세요.
      </p>
      <p>※ 가능하다면 이 기능의 사용은 지양해 주세요.</p>
    </>
  ),
  departure4_menu0_fromList_legacyView: "구버전 보기",
  departure4_menu0_fromList_addWord: "단어 추가",
  departure4_menu1: "조회 & 수정",
  departure4_menu1_errorNoInput: "검색어를 입력하세요.",
  departure4_menu1_title_byData: "단어 조회하기",
  departure4_menu1_byData_search: "단어를 조회",
  departure4_menu1_byData_noResult: "검색 결과가 없습니다.",
  departure4_menu1_title_update: "단어 수정하기",
  departure4_menu1_update_noResult:
    "조회 버튼을 눌러 수정할 단어를 불러오세요.",
  departure4_menu1_title_meaning: "뜻 수정하기",
  departure4_menu2: "삭제",
  departure4_menu2_title_byData: "단어 삭제하기",
  departure4_menu2_desc_byData: (
    <>
      <p>※ 데이터베이스에서 단어를 삭제해요.</p>
      <p>
        ※ 이 기능은 단어에서 주제를 삭제하는 기능이 <b>아니에요</b>.
      </p>
      <p>※ 의도하지 않은 데이터 손실이 발생할 수 있으니 사용 시 주의하세요.</p>
    </>
  ),
  departure4_menu2_byData_confirm: (word: string) => (
    <>
      <p>단어 {josa(`"${word}"#{을}`)} 삭제합니다.</p>
      <p>계속할까요?</p>
    </>
  ),
  departure4_menu2_title_theme: "단어에서 주제 삭제하기",

  departure8_menu0: "조회",
});
