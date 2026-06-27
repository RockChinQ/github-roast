/**
 * Auth.js (NextAuth v5) — "Login with GitHub" for identity only.
 *
 * Optional, like {@link ./db} and {@link ./redis}: when the OAuth env vars are
 * absent the login entry hides ({@link authConfigured}) and the rest of the app
 * runs unchanged. Sessions are stateless JWT cookies (no DB adapter); the only
 * persistence is a best-effort upsert into our own `users` table on sign-in,
 * which lays the groundwork for the upcoming comments feature.
 */

import NextAuth from "next-auth";
import GitHub, { type GitHubProfile } from "next-auth/providers/github";
import { upsertUser } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    // `profile` is only present on the initial sign-in; persist the GitHub
    // identity into the token so later requests don't need to re-fetch it.
    jwt({ token, profile }) {
      if (profile) {
        const p = profile as unknown as GitHubProfile;
        token.login = p.login;
        token.githubId = p.id;
        if (p.avatar_url) token.picture = p.avatar_url;
      }
      return token;
    },
    session({ session, token }) {
      session.user.login = (token.login as string | undefined) ?? "";
      session.user.githubId = (token.githubId as number | undefined) ?? 0;
      if (typeof token.picture === "string") session.user.image = token.picture;
      return session;
    },
  },
  events: {
    // Best-effort persistence; never blocks login (upsertUser no-ops without Turso).
    async signIn({ profile }) {
      if (!profile) return;
      const p = profile as unknown as GitHubProfile;
      await upsertUser({
        github_id: p.id,
        login: p.login,
        name: p.name ?? null,
        avatar_url: p.avatar_url ?? null,
      });
    },
  },
});

/** Whether GitHub OAuth is configured. UI hides the login entry when false. */
export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_SECRET);
}
