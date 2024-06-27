export default class ClassName extends Array<string> {
  constructor(name: string = "") {
    super(...name.split(" "));
  }
  public if(condition: boolean | (() => boolean), name: string): this {
    if ((typeof condition === "function" && condition()) || condition) {
      this.push(name);
    }
    return this;
  }
  public toString(): string {
    return this.join(" ");
  }
}
