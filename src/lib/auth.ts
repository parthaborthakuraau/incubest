import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SUPER_ADMIN_EMAIL } from "./constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google OAuth (optional — works if env vars are set)
    ...(process.env.GOOGLE_CLIENT_ID ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ] : []),
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

        // Use activeStartupId or first startup
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
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        // Auto-assign SUPER_ADMIN for hardcoded email
        token.role = u.email === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : u.role;
        token.organizationId = u.organizationId;
        token.startupId = u.startupId;
        token.teamRole = u.teamRole;
        token.assignedProgramId = u.assignedProgramId;
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
