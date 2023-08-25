export default class ObjectMap<K, V extends object> extends Map<K, V> {
  public keysAsArray(): K[] {
    return Array.from(this.keys());
  }
  public valuesAsArray(): V[] {
    return Array.from(this.values());
  }
  public evaluate<T extends keyof V>(
    method: T,
    ...args: Parameters<V[T]>
  ): ReturnType<V[T]>[] {
    return this.valuesAsArray().map((v) => v[method](...args));
  }
}
