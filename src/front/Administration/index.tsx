import React from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import Main from "front/Administration/pages";
import { Nest } from "common/Nest";
import { Database } from "../../common/Database";
import { EnumValueIterator } from "../../common/Utility";

import Owner from "front/Administration/pages/Owner";
import Management from "front/Administration/pages/Management";
import DatabaseWord from "front/Administration/pages/DatabaseWord";
import DatabaseShop from "front/Administration/pages/DatabaseShop";
import ClassName from "front/@global/ClassName";

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
export default class Administration extends React.PureComponent<
  Nest.Page.Props<"Administration">,
  State
> {
  public readonly state: State = {
    departure: Database.Departure.None,
    index: 0,
  };

  public render() {
    return (
      <article id="main">
        <aside>
          <ul className="menu">
            {EnumValueIterator(Database.Departure).map((departure, index) => {
              if (
                departure !== Database.Departure.None &&
                !(this.props.data.departures & departure)
              ) {
                return null;
              }

              return (
                <li key={index} className="item">
                  <div
                    className={new ClassName("title")
                      .if(this.state.departure === departure, "active")
                      .toString()}
                    onClick={() =>
                      this.setState({ departure, index: undefined })
                    }
                  >
                    {L.get(`departure${departure}`)}
                  </div>
                  <ul>
                    {PAGES[departure].map((_, index) => (
                      <li
                        key={index}
                        className={new ClassName("title")
                          .if(
                            this.state.departure === departure &&
                              this.state.index === index,
                            "active"
                          )
                          .toString()}
                        onClick={() => this.setState({ departure, index })}
                      >
                        {L.get(`departure${departure}_menu${index}`)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </aside>
        <section className="body">
          {this.state.departure === Database.Departure.None ? (
            <Main />
          ) : this.state.index ===
            undefined ? null /* TODO: 부서 대상 공지 등 메인 페이지 */ : (
            React.createElement(PAGES[this.state.departure][this.state.index])
          )}
        </section>
      </article>
    );
  }
}
Bind(Administration);

