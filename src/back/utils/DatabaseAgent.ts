import * as TypeORM from "typeorm";

import { ValueTransformer } from "typeorm/decorator/options/ValueTransformer";

import DB from "back/utils/Database";

export function Transaction(): MethodDecorator {
  return (target, propKey, descriptor) => {
    if (!(descriptor.value instanceof Function)) return;
    const original = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      const self = this;
      const tip = args.length - 1;

      if (args[tip] instanceof TypeORM.EntityManager) {
        return original.call(self, ...args);
      } else {
        return DB.Manager.transaction((manager) => {
          if (args[tip] === undefined) {
            args[tip] = manager;
          }
          return original.call(self, ...args, manager);
        });
      }
    } as any;
  };
}
export namespace Transformer {
  const PARSER_POINT_FROM = /^POINT\((\S+) (\S+)\)$/;

  export const Bool: ValueTransformer = {
    from: (v: number) => Boolean(v),
    to: (v: Boolean) => (v ? 1 : 0),
  };
  export const List: ValueTransformer = {
    from: (v: string) => (v ? v.split(",") : []),
    to: (v: string[]) => (v ? v.join(",") : ""),
  };
  export const Point: ValueTransformer = {
    from: (v: string) => {
      return v.match(PARSER_POINT_FROM)!.slice(1).map(Number);
    },
    to: (v: number[]) => {
      return v && `POINT(${v[0]} ${v[1]})`;
    },
  };
}
