import { create } from 'zustand';
import { useValidationStore } from './validationStore';

interface User {
  username: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;

  login: (username: string, password: string) => boolean;

  register: (
    username: string,
    password: string
  ) => {
    success: boolean;
    message: string;
  };

  logout: () => void;
  // Server-backed login: creates or returns a user from the backend
  loginServer: (email: string, name?: string) => Promise<{
    success: boolean;
    user?: { id: number; email: string; name?: string } | null;
    message?: string;
    sync?: { synced: number; errors: string[] } | null;
  }>;
  getServerUserId: () => string | null;
}

const USERS_KEY = 'validation_users';

function getUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    return [];
  }

  return JSON.parse(stored);
}

function saveUsers(users: User[]) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,

  username: null,

  login: (username, password) => {
    const users = getUsers();

    const found = users.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (found) {
      set({
        isAuthenticated: true,
        username,
      });

      return true;
    }

    return false;
  },

  register: (username, password) => {
    const users = getUsers();

    const exists = users.some(
      (u) => u.username === username
    );

    if (exists) {
      return {
        success: false,
        message: 'Username already exists',
      };
    }

    users.push({
      username,
      password,
    });

    saveUsers(users);

    return {
      success: true,
      message: 'Account created successfully',
    };
  },

  logout: () => {
    set({
      isAuthenticated: false,
      username: null,
    });
    localStorage.removeItem('validation_server_user');
  },

  loginServer: async (email, name) => {
    try {
      const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        const txt = await res.text();
        return { success: false, message: txt };
      }

      const json = await res.json();
      const user = json.user;

      if (user && user.id) {
        localStorage.setItem('validation_server_user', JSON.stringify(user));
        set({ isAuthenticated: true, username: user.email || null });

        // After successful server login, sync local history to server
        try {
          const userId = user.id;
          const sync = useValidationStore.getState().syncLocalHistoryToServer;
          if (typeof sync === 'function') {
            const result = await sync(userId);
            return { success: true, user, sync: result };
          }
        } catch (err: any) {
          console.error('sync after login failed', err);
          return { success: true, user, sync: { synced: 0, errors: [err?.message || 'sync error'] } };
        }

        return { success: true, user, sync: { synced: 0, errors: [] } };
      }

      return { success: false, message: 'no user returned' };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err?.message || 'error' };
    }
  },

  getServerUserId: () => {
    try {
      const stored = localStorage.getItem('validation_server_user');
      if (!stored) return null;
      const u = JSON.parse(stored);
      return u?.id?.toString() ?? null;
    } catch {
      return null;
    }
  },
}));