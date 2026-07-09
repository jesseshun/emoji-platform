'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { type AdminUser, getAdminMe, adminLogout } from '@/lib/adminApi';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await getAdminMe();
        if (active) setAdmin(me);
      } catch {
        if (active) {
          setAdmin(null);
          router.replace('/admin/login');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      // ignore network errors on logout; always clear local state
    }
    setAdmin(null);
    router.replace('/admin/login');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        正在加载…
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ admin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
