declare type Table<V> = {
  [key: string]: V;
};
declare interface Window {
  editedSections: Database.Section<"s_sec">[];
}
