export default class ObjectMap<
  K extends string | number | symbol,
  V extends object
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
  public evaluate<T extends keyof V>(
    method: T,
    ...args: Parameters<V[T]>
  ): ReturnType<V[T]>[] {
    return this.valuesAsArray().map((v) => v[method](...args));
  }
}
