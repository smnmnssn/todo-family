// src/lib/auth-session.ts
import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';


export async function getCurrentUser() {
  const session = await getServerSession({
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) return null;
          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!isValid) return null;
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name ?? undefined,
          };
        },
      }),
    ],
    session: { strategy: 'jwt' },
  } as NextAuthOptions);

  return session?.user ?? null;
}
