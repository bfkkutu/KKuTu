// ExpressAgent에서 재정의하고 있다.
declare namespace Express {
  export interface Request {
    address: string;
    agentInfo: string;
    locale: string;
  }
  export interface Response {
    metadata: Nest.Page.Metadata;
    removeCookie(name: string, path?: string): Express.Response;
    setCookie(name: string, value: any, path?: string): Express.Response;
  }
}
