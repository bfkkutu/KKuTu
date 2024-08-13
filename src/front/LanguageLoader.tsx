import React from "react";
import { I18n } from "@daldalso/i18n";
import type { I18nInitializerProps } from "@daldalso/i18n/dist/types";

interface Props extends I18nInitializerProps {
  children: React.ReactNode;
}
export default function LanguageLoader(props: Props) {
  I18n.initialize(
    (prefix) =>
      import(
        `front/@global/languages/${props.locale}/${prefix}.${props.locale}`
      )
  ).then(() => {
    try {
      document.title = I18n.retrieve("title", []);
    } catch (e) {}
  });
  return props.children as React.ReactElement;
}
