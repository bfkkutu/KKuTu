import React from "react";

export default class DialogTuple {
  private static count = 0;
  public id = DialogTuple.count++;
  public title: string;
  public body: React.FC;
  public footer: React.FC;
  constructor(title: string, body: React.FC, footer: React.FC) {
    this.title = title;
    this.body = body;
    this.footer = footer;
  }
}
