import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SUPER_ADMIN_EMAIL } from "./constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google OAuth (optional - works if env vars are set)
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { startups: { select: { id: true }, take: 1 } },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        const startupId = user.activeStartupId || user.startups[0]?.id || null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          startupId,
          teamRole: user.teamRole,
          assignedProgramId: user.assignedProgramId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, link to existing account or allow new sign-in
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Check if this Google account is already linked
          const existingAccount = await db.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: "google",
            },
          });

          if (!existingAccount) {
            // Link Google account to existing user
            await db.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          // Update user name/image if missing
          if (!existingUser.name && user.name) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { name: user.name },
            });
          }

          return true;
        }

        // New Google user - they need to register first via /register
        // (we need org details that Google doesn't provide)
        return "/register?error=no-account&email=" + encodeURIComponent(user.email);
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;

        if (account?.provider === "google") {
          // For Google sign-in, load full user data from database
          const dbUser = await db.user.findUnique({
            where: { email: u.email! },
            include: { startups: { select: { id: true }, take: 1 } },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.email === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : dbUser.role;
            token.organizationId = dbUser.organizationId;
            token.startupId = dbUser.activeStartupId || dbUser.startups[0]?.id || null;
            token.teamRole = dbUser.teamRole;
            token.assignedProgramId = dbUser.assignedProgramId;
          }
        } else {
          // Credentials sign-in - data already in user object
          token.role = u.email === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : u.role;
          token.organizationId = u.organizationId;
          token.startupId = u.startupId;
          token.teamRole = u.teamRole;
          token.assignedProgramId = u.assignedProgramId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = session.user as any;
        s.id = token.sub!;
        s.role = token.role;
        s.organizationId = token.organizationId;
        s.startupId = token.startupId;
        s.teamRole = token.teamRole;
        s.assignedProgramId = token.assignedProgramId;
      }
      return session;
    },
  },
});
