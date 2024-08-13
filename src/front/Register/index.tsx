import React, { useEffect, useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import lCommon from "front/@global/languages/l.common";
import lRegister from "front/@global/languages/l.register";
import Bind from "front/ReactBootstrap";

export default function Register() {
  const { l } = useLexicon(lCommon, lRegister);
  const [page, setPage] = useState(0);
  const [serviceTerms, setServiceTerms] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [nickname, setNickname] = useState("");
  const [exordial, setExordial] = useState("");

  switch (page) {
    case 0:
      return (
        <article id="main">
          <h1>{l("serviceTerms")}</h1>
          <Document src="/docs/service_terms" />
          <label htmlFor="checkbox-service-terms" className="checkbox-wrapper">
            <input
              type="checkbox"
              id="checkbox-service-terms"
              className="checkbox"
              checked={serviceTerms}
              onChange={(e) => setServiceTerms(e.currentTarget.checked)}
            />
            {l("agree")}
          </label>
          <h1>{l("privacyPolicy")}</h1>
          <Document src="/docs/privacy_policy" />
          <label htmlFor="checkbox-privacy-policy" className="checkbox-wrapper">
            <input
              type="checkbox"
              id="checkbox-privacy-policy"
              className="checkbox"
              checked={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.currentTarget.checked)}
            />
            {l("agree")}
          </label>
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={!(serviceTerms && privacyPolicy)}
          >
            {l("next")}
          </button>
        </article>
      );
    case 1:
      return (
        <article id="main">
          <form
            className="form"
            onSubmit={async (e) => {
              e.preventDefault();
              const { ok } = await fetch("/register", {
                method: "POST",
                body: JSON.stringify({
                  nickname,
                  exordial,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              });
              if (ok) {
                await window.alert(l("success"));
                location.href = "/";
              } else {
                window.alert(
                  <>
                    <label>{l("fail")}</label>
                    <label>{l("error_409_nickname")}</label>
                  </>
                );
              }
            }}
          >
            <label className="form-item-wrapper">
              <label htmlFor="input-nickname">{l("nickname")}</label>
              <input
                id="input-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.currentTarget.value)}
              />
            </label>
            <label className="form-item-wrapper">
              <label htmlFor="input-exordial">{l("exordial")}</label>
              <input
                id="input-exordial"
                value={exordial}
                onChange={(e) => setExordial(e.currentTarget.value)}
                placeholder={l("optional") as string}
              />
            </label>
            <button type="submit">{l("next")}</button>
          </form>
        </article>
      );
  }
  return null;
}

interface Props {
  src: string;
}
function Document(props: Props) {
  const { l } = useLexicon(lCommon, lRegister);
  const [content, setContent] = useState<string>(l("loading"));

  useEffect(() => {
    fetch(props.src)
      .then((res) => res.text())
      .then((content) => setContent(content))
      .catch(() => setContent(l("failedToLoad")));
  }, []);

  return (
    <div
      className="document-box"
      dangerouslySetInnerHTML={{ __html: content as string }}
    />
  );
}
Bind(Register);

