import React from "react";
import { I18n } from "@daldalso/i18n";

export default I18n.register({
  title: "BF끄투 - 계정 등록",

  failedToLoad: "불러오지 못했습니다.",
  agree: "동의합니다.",
  success: (
    <>
      <p>계정을 등록했습니다.</p>
      <p>메인 화면으로 돌아갑니다.</p>
    </>
  ),
  fail: "계정 등록에 실패했습니다.",
});
