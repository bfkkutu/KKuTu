import React from "react";

const PROPS = eval("window['__PROPS']");

const PATTERN_RESOLVER: {
  [key: string]: (key: number, ...args: string[]) => React.ReactNode;
} = {
  FA: (key, name) => <i className={`fa fa-${name}`} />,
};
export default function L(key: string) {
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
