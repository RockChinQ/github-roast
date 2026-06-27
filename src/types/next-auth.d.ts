/**
 * Module augmentation so the GitHub identity we stash on the JWT/session is
 * typed (NextAuth v5 ships only name/email/image on `session.user` by default).
 */
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** GitHub handle, e.g. "torvalds". */
      login: string;
      /** GitHub numeric account id (stable across renames). */
      githubId: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
    githubId?: number;
  }
}
