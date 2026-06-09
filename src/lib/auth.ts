import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [];

// Google OAuth — only registered when credentials are configured.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

// Passwordless demo login so the app is usable without configuring Google.
// Guarded by ENABLE_DEV_LOGIN — must never be enabled in production.
if (process.env.ENABLE_DEV_LOGIN === "true") {
  providers.push(
    CredentialsProvider({
      id: "dev",
      name: "Demo account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        name: { label: "Display name", type: "text", placeholder: "Money Tycoon" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email) return null;
        const name = credentials?.name?.trim() || email.split("@")[0];

        // Upsert so holdings can reference a real DB user even under JWT sessions.
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name },
        });
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  // JWT sessions let Google and the credentials demo login coexist.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // Surface profile fields used for wealth comparison.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { birthYear: true, country: true },
        });
        session.user.birthYear = dbUser?.birthYear ?? null;
        session.user.country = dbUser?.country ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
