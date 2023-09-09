import "express-session";

declare module "express-session" {
  interface Session {
    save(): Promise<void>;
    saveSync(callback?: (err: any) => void): Exession.Session;
  }
}
