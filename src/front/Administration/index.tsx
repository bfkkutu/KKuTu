import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import ClassName from "front/@global/ClassName";
import lAdministration from "front/@global/languages/l.administration";
import Bind from "front/ReactBootstrap";
import Main from "front/Administration/pages";
import { Nest } from "common/Nest";
import { Database } from "../../common/Database";
import { enumValues } from "../../common/Utility";

import Owner from "front/Administration/pages/Owner";
import Management from "front/Administration/pages/Management";
import DatabaseWord from "front/Administration/pages/DatabaseWord";
import DatabaseShop from "front/Administration/pages/DatabaseShop";

const PAGES: Record<number, React.FC<{}>[]> = {
  [Database.Departure.None]: [],
  [Database.Departure.Owner]: Owner.MENUS,
  [Database.Departure.Management]: Management.MENUS,
  [Database.Departure.DatabaseWord]: DatabaseWord.MENUS,
  [Database.Departure.DatabaseShop]: DatabaseShop.MENUS,
};

interface State {
  departure: Database.Departure;
  index?: number;
}
export default function Administration(
  props: Nest.Page.Props<"Administration">
) {
  const { l } = useLexicon(lAdministration);
  const [state, setState] = useState<State>({
    departure: Database.Departure.None,
    index: 0,
  });

  return (
    <article id="main">
      <aside>
        <ul className="menu">
          {enumValues(Database.Departure).map((departure, index) => {
            if (
              departure !== Database.Departure.None &&
              !(props.data.departures & departure)
            ) {
              return null;
            }

            return (
              <li key={index} className="item">
                <div
                  className={new ClassName("title")
                    .if(state.departure === departure, "active")
                    .toString()}
                  onClick={() => setState({ departure, index: undefined })}
                >
                  {l("departure", departure)}
                </div>
                <ul>
                  {PAGES[departure].map((_, index) => (
                    <li
                      key={index}
                      className={new ClassName("title")
                        .if(
                          state.departure === departure &&
                            state.index === index,
                          "active"
                        )
                        .toString()}
                      onClick={() => setState({ departure, index })}
                    >
                      {
                        l(
                          `departure${departure}_menu${index}` as any
                        ) /* TODO */
                      }
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="body">
        {state.departure === Database.Departure.None ? (
          <Main />
        ) : state.index ===
          undefined ? null /* TODO: 부서 대상 공지 등 메인 페이지 */ : (
          React.createElement(PAGES[state.departure][state.index])
        )}
      </section>
    </article>
  );
}
Bind(Administration);

