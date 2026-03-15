import { create } from "zustand";
import type { UserProfile, MeResponse } from "../lib/types";
import * as api from "../lib/api";

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  followingIds: number[];
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (phoneNumber: string, password: string) => Promise<void>;
  startAuth: (phoneNumber: string) => Promise<number | null>;
  logout: () => Promise<void>;
  setFromMe: (me: MeResponse) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  followingIds: [],
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const me = await api.getMe();
      set({
        isAuthenticated: true,
        user: me.user_profile ?? null,
        followingIds: me.following_ids ?? [],
        isLoading: false,
      });
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        followingIds: [],
        isLoading: false,
      });
    }
  },

  startAuth: async (phoneNumber: string) => {
    set({ error: null });
    try {
      const res = await api.startPhoneAuth(phoneNumber);
      return res.num_digits;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      set({ error: message });
      throw err;
    }
  },

  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.completeAuth(phoneNumber, password);
      const me = await api.getMe();
      set({
        isAuthenticated: true,
        user: me.user_profile ?? null,
        followingIds: me.following_ids ?? [],
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        followingIds: [],
        isLoading: false,
        error: null,
      });
    }
  },

  setFromMe: (me: MeResponse) => {
    set({
      isAuthenticated: true,
      user: me.user_profile ?? null,
      followingIds: me.following_ids ?? [],
    });
  },

  clearError: () => set({ error: null }),
}));
