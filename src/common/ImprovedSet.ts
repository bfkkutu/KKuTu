export default class ImprovedSet<T> extends Set<T> {
  public keysAsArray(): T[] {
    return this.valuesAsArray();
  }
  public valuesAsArray(): T[] {
    return Array.from(this.values());
  }
  public evaluate<F extends (...args: any) => any>(
    func: F,
    ...args: Parameters<F>
  ): ReturnType<F>[] {
    return this.valuesAsArray().map((v) => func.call(v, ...args));
  }
}
