// src/lib/auth-options.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        mode: { label: 'Mode', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const mode = credentials?.mode;
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        if (mode === 'register') {
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) return null;

          const passwordHash = await bcrypt.hash(password, 10);

          const newUser = await prisma.user.create({
            data: {
              email,
              passwordHash,
            },
          });

          return {
            id: newUser.id.toString(),
            email: newUser.email,
          };
        }

        if (mode === 'login') {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id.toString(),
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

callbacks: {
  async jwt({ token, user }) {
    if (user) token.id = user.id as string;
    return token;
  },
  async session({ session, token }) {
    if (session.user && token.id) {
      session.user.id = token.id as string;
    }
    return session;
  },
},

};
