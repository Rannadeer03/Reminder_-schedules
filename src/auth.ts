import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
          ].join(" "),
          access_type: "offline",
          prompt:      "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) token.id = user.id;

      // Save fresh tokens on every Google sign-in (not just first link)
      if (account?.provider === "google" && account.access_token && user?.id) {
        try {
          const updateData = {
            accessToken: encrypt(account.access_token),
            expiresAt:   new Date(Date.now() + (account.expires_at ?? 3600) * 1000),
            email:       user.email!,
            syncToken:   null as string | null, // force full re-sync on reconnect
          };
          // Only overwrite refresh token when Google sends a new one
          const data = account.refresh_token
            ? { ...updateData, refreshToken: encrypt(account.refresh_token) }
            : updateData;

          await db.calendarConnection.upsert({
            where:  { userId: user.id },
            create: {
              userId:       user.id,
              refreshToken: encrypt(account.refresh_token ?? ""),
              ...data,
            },
            update: data,
          });
        } catch (e) {
          console.error("[auth] Failed to update calendar tokens:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      // Still handle first-time link for settings upsert
      if (account.provider === "google") {
        await db.settings.upsert({
          where:  { userId: user.id! },
          create: { userId: user.id! },
          update: {},
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: { strategy: "jwt" },
});
