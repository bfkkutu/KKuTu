import React from "react";
import ReactDOM from "react-dom/client";

import Header from "./@part/Header";
import Jungle from "./@part/Jungle";
import Footer from "./@part/Footer";

interface RootProps {
  session: any;
  children: React.ReactNode;
}
interface RootState {}

const PROPS = eval("window['__PROPS']");

export default function Bind(TargetClass: any) {
  const $root = document.getElementById("stage") as HTMLTableSectionElement;

  ReactDOM.createRoot($root).render(
    React.createElement(Root, PROPS, React.createElement(TargetClass, PROPS))
  );
}
export interface Props {
  ALTERNATIVE_HOST: string;
  AVAIL_EQUIP: string[];
  CATEGORIES: string[];
  EN_INJEONG: string[];
  EN_THEME: string[];
  GROUPS: any;
  HOST: string;
  PORT: number;
  IJP_EXCEPT: string[];
  KO_EVENT: string[];
  KO_INJEONG: string[];
  KO_THEME: string[];
  MODE: string[];
  MOREMI_PART: string[];
  OPTIONS: any;
  PROTOCOL: string;
  RULE: any;
  cache: boolean;
  initPage: string;
  lang: string;
  locale: any;
  ogDescription: string;
  ogImage: string;
  ogTitle: string;
  ogURL: string;
  page: string;
  published: boolean;
  session: { profile?: any };
  settings: any;
  title: string;
  version: string;
  wrapPage?: boolean;
  _id: string;
  _locals: any;
  _page: string;
}
export class Root extends React.PureComponent<RootProps, RootState> {
  render() {
    return PROPS.wrapPage ? (
      <>
        <Header {...PROPS} />
        <Jungle />
        {this.props.children}
        <Footer />
      </>
    ) : (
      <>{this.props.children}</>
    );
  }
}
