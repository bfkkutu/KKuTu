import "connect-redis";
import { Session, SessionData } from "express-session";

declare module "connect-redis" {
  export default interface RedisStore {
    get(sid: string): Promise<any>;
    getSync(
      sid: string,
      cb?: (_err?: unknown, _data?: any) => void
    ): Promise<void>;
  }
}
