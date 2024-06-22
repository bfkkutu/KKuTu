import React from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { Nest } from "common/Nest";

interface State {
  page: number;

  serviceTerms: string;
  privacyPolicy: string;

  agreeServiceTerms: boolean;
  agreePrivacyPolicy: boolean;

  nickname: string;
  exordial: string;
}

export default class Register extends React.PureComponent<
  Nest.Page.Props<"Register">,
  State
> {
  public state: State = {
    page: 0,

    serviceTerms: L.get("loading"),
    privacyPolicy: L.get("loading"),

    agreeServiceTerms: false,
    agreePrivacyPolicy: false,

    nickname: "",
    exordial: "",
  };
  public async componentDidMount(): Promise<void> {
    try {
      const serviceTerms = await (await fetch("/docs/service_terms")).text();
      const privacyPolicy = await (await fetch("/docs/privacy_policy")).text();
      if (this.props.session.profile === undefined) return console.log("error");
      this.setState({
        serviceTerms,
        privacyPolicy,

        nickname: this.props.session.profile.name,
        exordial: this.props.session.profile.exordial,
      });
    } catch (e) {}
  }
  public render() {
    switch (this.state.page) {
      case 0:
        return (
          <article id="main">
            <h1>{L.get("serviceTerms")}</h1>
            <div
              className="document-box"
              dangerouslySetInnerHTML={{ __html: this.state.serviceTerms }}
            />
            <label
              htmlFor="checkbox-service-terms"
              className="checkbox-wrapper"
            >
              <input
                type="checkbox"
                id="checkbox-service-terms"
                className="checkbox"
                checked={this.state.agreeServiceTerms}
                onClick={() =>
                  this.setState({
                    agreeServiceTerms: !this.state.agreeServiceTerms,
                  })
                }
              />
              {L.get("agree")}
            </label>
            <h1>{L.get("privacyPolicy")}</h1>
            <div
              className="document-box"
              dangerouslySetInnerHTML={{ __html: this.state.privacyPolicy }}
            />
            <label
              htmlFor="checkbox-privacy-policy"
              className="checkbox-wrapper"
            >
              <input
                type="checkbox"
                id="checkbox-privacy-policy"
                className="checkbox"
                checked={this.state.agreePrivacyPolicy}
                onClick={() =>
                  this.setState({
                    agreePrivacyPolicy: !this.state.agreePrivacyPolicy,
                  })
                }
              />
              {L.get("agree")}
            </label>
            <button
              type="button"
              onClick={() => this.setState({ page: 1 })}
              disabled={
                !this.state.agreeServiceTerms || !this.state.agreePrivacyPolicy
              }
            >
              {L.get("next")}
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
                    nickname: this.state.nickname,
                    exordial: this.state.exordial,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                if (ok) {
                  await window.alert(L.get("success"));
                  location.href = "/";
                } else
                  window.alert(
                    <>
                      <label>{L.get("fail")}</label>
                      <label>{L.get("error_409_nickname")}</label>
                    </>
                  );
              }}
            >
              <label className="form-item-wrapper">
                <label htmlFor="input-nickname">{L.get("nickname")}</label>
                <input
                  id="input-nickname"
                  value={this.state.nickname}
                  onChange={(e) =>
                    this.setState({
                      nickname: e.currentTarget.value,
                    })
                  }
                />
              </label>
              <label className="form-item-wrapper">
                <label htmlFor="input-exordial">{L.get("exordial")}</label>
                <input
                  id="input-exordial"
                  value={this.state.exordial}
                  onChange={(e) =>
                    this.setState({
                      exordial: e.currentTarget.value,
                    })
                  }
                  placeholder={L.get("optional")}
                />
              </label>
              <button type="submit">{L.get("next")}</button>
            </form>
          </article>
        );
    }
  }
}
Bind(Register);
