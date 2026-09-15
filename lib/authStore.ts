export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  preferredLoginType: string;
  role: 'admin' | 'user' | 'agent';
  agentId?: string;
  agentCode?: string;
  agentBusinessName?: string;
  appNames?: string[];
  uniqueIdentifier?: string;
  tenantId?: string;
}

import { getUserData, type DecodedUserData } from '@/helper/user-data';
export { getUserData, type DecodedUserData };

const KEYS = {
  SESSION: 'sk_active_session',
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('localStorage write failed for key:', key);
  }
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  mobile: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8030/api';
    const response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errText = 'Registration failed';
      try {
        const errJson = await response.json();
        errText = errJson.message || errText;
      } catch { }
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err) {
    console.error('Backend register failed:', err);
    return { success: false, error: 'Unable to connect to server. Please try again.' };
  }
}

export async function login(
  usernameOrEmail: string,
  passwordStr: string
): Promise<{ success: boolean; user?: Omit<User, 'password'>; error?: string }> {
  const emailLower = usernameOrEmail.toLowerCase().trim();

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8030/api';
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLower, password: passwordStr }),
    });

    if (!response.ok) {
      let errText = 'Invalid credentials';
      try {
        const errJson = await response.json();
        errText = errJson.message || errText;
      } catch { }
      return { success: false, error: errText };
    }

    const data = await response.json();
    const normalizedRole = data.role === 'ADMIN' ? 'admin' : 'user';

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', normalizedRole);
    localStorage.setItem('fullName', data.fullName);

    const sessionUser: Omit<User, 'password'> = {
      id: data.id ? String(data.id) : `u-${Date.now()}`,
      fullName: data.fullName,
      email: data.email || emailLower,
      mobile: data.mobile || '',
      preferredLoginType: data.preferredLoginType || '',
      role: normalizedRole,
    };

    safeSet(KEYS.SESSION, sessionUser);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authChange'));
    }

    return { success: true, user: sessionUser };
  } catch (err) {
    console.error('Backend login failed:', err);
    return { success: false, error: 'Unable to connect to server. Please try again.' };
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('fullName');
  localStorage.removeItem('user');

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('sk_admin_auth');

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('authChange'));
}

export function getCurrentUser(): Omit<User, 'password'> | null {
  const sessionUser = safeGet<Omit<User, 'password'>>(KEYS.SESSION);
  if (sessionUser && sessionUser.fullName) {
    return sessionUser;
  }

  // Fallback: Decode token if sessionUser is missing or has empty name
  const tokenData = getUserData();
  if (tokenData) {
    const rawRole = Array.isArray(tokenData.role) ? tokenData.role[0] : tokenData.role;
    const normalizedRole =
      rawRole?.toUpperCase() === 'ADMIN' ? 'admin' : rawRole?.toUpperCase() === 'AGENT' ? 'agent' : 'user';

    const fallbackUser: Omit<User, 'password'> = {
      id: tokenData.uniqueIdentifier || sessionUser?.id || `u-${Date.now()}`,
      fullName: tokenData.name || sessionUser?.fullName || '',
      email: tokenData.email || sessionUser?.email || '',
      mobile: sessionUser?.mobile || '',
      preferredLoginType: sessionUser?.preferredLoginType || '',
      role: normalizedRole,
      tenantId: tokenData.tenantId,
      appNames: tokenData.appNames,
      uniqueIdentifier: tokenData.uniqueIdentifier,
    };
    return fallbackUser;
  }

  return sessionUser;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export function isAgent(): boolean {
  const user = getCurrentUser();
  return user?.role === 'agent';
}

export function getAgentSession(): { agentId: string; agentCode: string; agentBusinessName: string } | null {
  const user = getCurrentUser();
  if (user?.role !== 'agent' || !user.agentId) return null;
  return {
    agentId: user.agentId,
    agentCode: user.agentCode || '',
    agentBusinessName: user.agentBusinessName || '',
  };
}
