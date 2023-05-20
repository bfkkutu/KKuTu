export namespace Page {
  export type Type = keyof Page.DataTable;
  export type DataTable = {
    Portal: {};
  };
  export type Metadata = {
    titleArgs?: string[];
  };
  export interface Props<T extends Page.Type> {
    locale: string;
    page: T;
    path: string;
    title: string;

    data: Page.DataTable[T];
    version: string;

    metadata?: Page.Metadata;
    ssr?: boolean;

    children: React.ReactNode;
  }
}
