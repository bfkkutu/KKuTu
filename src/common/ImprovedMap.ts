export default class ImprovedMap<
  K extends string | number | symbol,
  V
> extends Map<K, V> {
  public keysAsArray(): K[] {
    return Array.from(this.keys());
  }
  public valuesAsArray(): V[] {
    return Array.from(this.values());
  }
  public entriesAsArray(): [K, V][] {
    return Array.from(this.entries());
  }
  public asRecord(): Record<K, V> {
    return this.entriesAsArray().reduce((prev, curr) => {
      prev[curr[0]] = curr[1];
      return prev;
    }, {} as Record<K, V>);
  }
  public evaluate<F extends (...args: any) => any>(
    func: F,
    ...args: Parameters<F>
  ): ReturnType<F>[] {
    return this.valuesAsArray().map((v) => func.call(v, ...args));
  }
}
