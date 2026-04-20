'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from './types';
import { getUserById, saveUser, getAllUsers } from './storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: 'client' | 'vendor', storeName?: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      const foundUser = getUserById(storedUserId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('currentUserId');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getAllUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUserId', foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'client' | 'vendor',
    storeName?: string
  ): Promise<boolean> => {
    const users = getAllUsers();
    if (users.find(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role,
      storeName: role === 'vendor' ? storeName || `Boutique de ${name}` : undefined,
      totalSales: 0,
      totalRevenue: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setUser(newUser);
    localStorage.setItem('currentUserId', newUser.id);
    return true;
  };

  const updateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
