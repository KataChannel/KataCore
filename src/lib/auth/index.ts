import NextAuth from 'next-auth';
import { authConfig } from './config';
import { authOptions } from './providers';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  ...authOptions,
});
