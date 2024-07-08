/**
 * Equivalent of python defaultdict.
 */
export default class DefaultDictionary<K extends hashable, V> {
  private readonly data = {} as Record<K, V>;
  private readonly defaultValue: V;

  constructor(defaultValue: V) {
    this.defaultValue = defaultValue;
  }

  public set(key: K, value: V): void {
    this.data[key] = value;
  }
  public get(key: K): V {
    if (!(key in this.data)) {
      this.data[key] = this.defaultValue;
    }
    return this.data[key];
  }
}
