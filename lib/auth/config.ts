import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { Database } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const authConfig = {
  pages: {
    signIn: '/',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mode: { label: 'Mode', type: 'text' }, // 'signin' or 'signup'
        displayName: { label: 'Display Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const mode = credentials.mode as string;
        const displayName = credentials.displayName as string | undefined;

        try {
          if (mode === 'signup') {
            // Sign up mode: create new user
            const existingUser = await Database.getUserByEmail(email);

            if (existingUser) {
              throw new Error('User already exists');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user with UUID
            const userId = uuidv4();
            const user = await Database.upsertUser({
              user_id: userId,
              email,
              password_hash: passwordHash,
              display_name: displayName,
            });

            return {
              id: user.user_id,
              email: user.email,
              name: user.display_name || null,
            };
          } else {
            // Sign in mode: authenticate existing user
            const user = await Database.getUserByEmail(email);

            if (!user) {
              return null;
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password_hash);

            if (!isValid) {
              return null;
            }

            return {
              id: user.user_id,
              email: user.email,
              name: user.display_name || null,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
