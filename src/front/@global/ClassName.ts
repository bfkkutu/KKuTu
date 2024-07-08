type Block = (name: ClassName) => void;
export default class ClassName extends Array<string> {
  private name?: string;

  constructor(name?: string | string[] | ClassName) {
    if (name === undefined) {
      super();
    } else if (name instanceof Array) {
      super(...name);
    } else {
      super(...name.split(" "));
    }
  }

  public if(condition: boolean, name: string): this;
  public if(condition: boolean, name: ClassName): this;
  public if(block: Block): this;
  public if(
    conditionOrBlock: boolean | Block,
    name?: string | ClassName
  ): this {
    this.next();
    if (typeof conditionOrBlock === "function") {
      const name = new ClassName();
      conditionOrBlock(name);
      this.push(...name);
    } else if (conditionOrBlock && name !== undefined) {
      if (name instanceof ClassName) {
        name = name.toString();
      }
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
  public elif(condition: boolean, name: string): this;
  public elif(condition: boolean, name: ClassName): this;
  public elif(condition: boolean, name: string | ClassName): this {
    this.next();
    if (condition) {
      if (name instanceof ClassName) {
        name = name.toString();
      }
      this.name = name;
    }
    return this;
  }
  private next(): void {
    if (this.name === undefined) {
      return;
    }
    this.push(this.name);
    this.name = undefined;
  }
  public toString(): string {
    if (this.name !== undefined) {
      this.push(this.name);
    }
    return this.join(" ");
  }
}

