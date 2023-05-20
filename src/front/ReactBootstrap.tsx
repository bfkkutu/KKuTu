import React from "react";
import ReactDOM from "react-dom/client";

import Header from "./@part/Header";
import Jungle from "./@part/Jungle";
import Footer from "./@part/Footer";

interface RootProps {
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
