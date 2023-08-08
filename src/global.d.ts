declare type Table<V> = {
  [key: string]: V;
};
declare type HexColor = `#${string & { length: 6 }}`;
