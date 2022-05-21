import React from "react";
import ReactDOM from "react-dom";

import Header from "./@part/Header";
import Jungle from "./@part/Jungle";
import Footer from "./@part/Footer";
import Loading from "./@page/Loading";

interface RootProps {
  session: any;
  children: React.ReactNode;
}
interface RootState {
  isLoading: boolean;
}

const PROPS = eval("window['__PROPS']");

export default function Bind(TargetClass: any) {
  const $root = document.getElementById("stage");

  ReactDOM.render(
    React.createElement(Root, PROPS, React.createElement(TargetClass, PROPS)),
    $root
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
  state: RootState = { isLoading: true };
  componentDidMount() {
    this.setState({ isLoading: false });
  }
  render() {
    return this.state.isLoading ? (
      <Loading />
    ) : PROPS.wrapPage ? (
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
const PATTERN_RESOLVER: {
  [key: string]: (key: number, ...args: string[]) => React.ReactNode;
} = {
  FA: (key, name) => <i className={`fa fa-${name}`} />,
};
export function L(key: string) {
  return PROPS.locale[key] || `(L#${key})`;
}
L.render = function (key: string, ...args: any[]) {
  const R: React.ReactNode[] = [];
  const PATTERN: RegExp = new RegExp(/<\{(\w+?)(?:\|(.+?))?\}>/g);
  const blockBank: React.ReactNode[] = [];
  let value: string = PROPS.locale[key];
  let execArray: RegExpExecArray | null;
  let prevIndex: number = 0;

  if (!value) return `(L#${key})`;
  value = value
    .replace(/\{##(\d+?)\}/g, (p, v1) => {
      return args[v1];
    })
    .replace(/\{#(\d+?)\}/g, (p, v1) => {
      blockBank.push(args[v1]);
      return "<{__}>";
    });
  while ((execArray = PATTERN.exec(value))) {
    if (execArray.index - prevIndex > 0) {
      R.push(value.slice(prevIndex, execArray.index));
    }
    if (execArray[1] === "__") {
      R.push(blockBank.shift());
    } else {
      R.push(
        PATTERN_RESOLVER[execArray[1]](
          R.length,
          ...(execArray[2] ? execArray[2].split("|") : [])
        )
      );
    }
    prevIndex = PATTERN.lastIndex;
  }
  if (prevIndex < value.length) R.push(value.slice(prevIndex));
  return <>{R}</>;
};
