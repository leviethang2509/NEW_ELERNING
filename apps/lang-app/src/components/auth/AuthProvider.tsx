'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthResponse, AuthUser } from '@lang/shared';
import type { WorkspaceOption } from '@/components/dashboard/WorkspaceSwitcher';
import { vi } from '@/i18n/vi';
import {
  api,
  onAuthFailure,
  refreshAccessToken,
  setAccessToken,
} from '@/lib/api';
import { isSystemManager } from '@/lib/auth-redirect';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Không gian cho switcher: hệ thống (Owner/Admin); tenant thêm ở Step 6. */
  contexts: WorkspaceOption[];
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Nhận phiên mới (vd. sau đổi mật khẩu có access token mới). */
  applySession: (session: AuthResponse) => void;
  /** Cập nhật user sau khi sửa hồ sơ. */
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

const anonymous: AuthState = { status: 'anonymous', user: null };

export function AuthProvider({
  hasSession,
  children,
}: {
  /** Server thấy cookie refresh; không có thì khỏi gọi /auth/refresh. */
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AuthState>(
    hasSession ? { status: 'loading', user: null } : anonymous,
  );

  const applySession = useCallback((session: AuthResponse) => {
    setAccessToken(session.accessToken);
    setState({ status: 'authenticated', user: session.user });
  }, []);

  // Tải trang: đổi refresh cookie lấy access token + user.
  useEffect(() => {
    if (!hasSession) return;
    let cancelled = false;
    void refreshAccessToken().then((session) => {
      if (cancelled) return;
      if (session) setState({ status: 'authenticated', user: session.user });
      else setState(anonymous);
    });
    return () => {
      cancelled = true;
    };
  }, [hasSession]);

  useEffect(() => onAuthFailure(() => setState(anonymous)), []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      applySession(session);
      return session.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await api.post<AuthResponse>('/auth/register', input);
      applySession(session);
      return session.user;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Lỗi mạng vẫn đăng xuất phía client.
    }
    setAccessToken(null);
    // Tải lại hẳn để xoá mọi dữ liệu đang giữ trong bộ nhớ.
    window.location.assign('/login');
  }, []);

  const setUser = useCallback((user: AuthUser) => {
    setState({ status: 'authenticated', user });
  }, []);

  const contexts = useMemo<WorkspaceOption[]>(
    () =>
      state.user && isSystemManager(state.user)
        ? [{ key: 'system', label: vi.shell.systemWorkspace, href: '/admin' }]
        : [],
    [state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      contexts,
      login,
      register,
      logout,
      applySession,
      setUser,
    }),
    [state, contexts, login, register, logout, applySession, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider');
  return value;
}
