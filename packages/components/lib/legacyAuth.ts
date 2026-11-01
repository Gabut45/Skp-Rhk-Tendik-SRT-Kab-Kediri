// Auth surface for apps written against the pre-monorepo zite-auth-sdk.
import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const DEFAULT_USER: User = {
  id: 'usr_wali_01',
  name: 'A. Zainudin Sholeh, S.A.P.',
  email: 'khususmyasn@gmail.com',
  image: null,
};

export function useAuth() {
  return {
    user: DEFAULT_USER,
    isLoading: false,
    loginWithRedirect: () => {},
    logout: () => {},
  };
}

export const useSession = () => ({
  data: {
    user: DEFAULT_USER,
  },
  isPending: false,
});

export const signIn = async () => ({ data: { user: DEFAULT_USER } });
export const signOut = async () => {};
export const signUp = async () => ({ data: { user: DEFAULT_USER } });
export const loginWithRedirect = () => {};
export const logout = () => {};
export const updateProfile = async (_data: any) => {};
