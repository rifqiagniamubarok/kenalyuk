/**
 * Auth.js v5 configuration with Prisma adapter
 * Handles authentication, session management, and role-based access
 */

import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@/types/auth";

const prisma = new PrismaClient();

/**
 * Auth.js configuration
 */
export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return user data for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          regionId: user.regionId,
          supervisorRegionId: user.supervisorRegionId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * JWT callback - adds custom fields to token
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status;
        token.regionId = user.regionId;
        token.supervisorRegionId = user.supervisorRegionId;
      }

      // Update session trigger (when session.update() is called)
      if (trigger === "update" && session) {
        token.role = session.role || token.role;
        token.status = session.status || token.status;
        token.regionId = session.regionId || token.regionId;
        token.supervisorRegionId =
          session.supervisorRegionId || token.supervisorRegionId;
      }

      return token;
    },

    /**
     * Session callback - adds custom fields to session
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.regionId = token.regionId as string | null;
        session.user.supervisorRegionId = token.supervisorRegionId as
          | string
          | null;
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Auth.js handlers
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

/**
 * Get server session helper - use in server components and API routes
 */
export { auth as getServerSession };
