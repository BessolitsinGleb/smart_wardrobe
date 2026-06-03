import React, { createContext, useContext } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User;
  onLogout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = UserContext.Provider;

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
