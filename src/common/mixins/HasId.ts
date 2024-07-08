export interface HasId<T extends string | number | symbol> {
  readonly id: T;
}
