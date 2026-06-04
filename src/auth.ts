import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
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
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user id into the JWT on first sign-in
      if (user) {
        token.id = user.id;
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
      if (account.provider === "google" && account.refresh_token) {
        const encryptedAccess = encrypt(account.access_token!);
        const encryptedRefresh = encrypt(account.refresh_token);

        await db.calendarConnection.upsert({
          where: { userId: user.id! },
          create: {
            userId: user.id!,
            accessToken: encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt: new Date(Date.now() + (account.expires_at ?? 3600) * 1000),
            email: user.email!,
          },
          update: {
            accessToken: encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt: new Date(Date.now() + (account.expires_at ?? 3600) * 1000),
            email: user.email!,
          },
        });

        await db.settings.upsert({
          where: { userId: user.id! },
          create: { userId: user.id! },
          update: {},
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
