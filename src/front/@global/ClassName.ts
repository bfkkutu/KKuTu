export default class ClassName extends Array<string> {
  private name?: string;

  constructor(name: string = "") {
    super(...name.split(" "));
  }

  public if(condition: boolean | (() => boolean), name: string): this {
    if (this.name !== undefined) {
      this.push(this.name);
      this.name = undefined;
    }
    if ((typeof condition === "function" && condition()) || condition) {
      this.name = name;
    }
    return this;
  }
  public else(name: string): this {
    if (this.name === undefined) {
      this.push(name);
    } else {
      this.push(this.name);
    }
    this.name = undefined;
    return this;
  }
  public toString(): string {
    if (this.name !== undefined) {
      this.push(this.name);
    }
    return this.join(" ");
  }
}

