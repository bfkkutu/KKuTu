export default class SerializableMap<
  K,
  V extends Serializable<any>
> extends Map<K, V> {
  public keysAsArray(): K[] {
    return Array.from(this.keys());
  }
  public valuesAsArray(): V[] {
    return Array.from(this.values());
  }
  public serialize(): ReturnType<V["serialize"]>[] {
    return this.valuesAsArray().map((v) => v.serialize());
  }
}
