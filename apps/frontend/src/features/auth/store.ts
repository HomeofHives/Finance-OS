import { create } from "zustand";
import type { User } from "../../entities/user/model";
import { authApi, type LoginInput, type RegisterInput } from "./api";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

// The session lives in an HttpOnly cookie; the store only mirrors the derived
// user profile so components can read authentication state without API access.
interface AuthState {
   user: User | null;
   status: AuthStatus;
   register: (input: RegisterInput) => Promise<User>;
   login: (input: LoginInput) => Promise<User>;
   logout: () => Promise<void>;
   fetchMe: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>()((set) => ({
   user: null,
   status: "idle",

   async register(input) {
      set({ status: "loading" });
      const user = await authApi.register(input);
      set({ user, status: "authenticated" });
      return user;
   },

   async login(input) {
      set({ status: "loading" });
      const user = await authApi.login(input);
      set({ user, status: "authenticated" });
      return user;
   },

   async logout() {
      await authApi.logout();
      set({ user: null, status: "unauthenticated" });
   },

   async fetchMe() {
      try {
         const user = await authApi.me();
         set({ user, status: "authenticated" });
         return user;
      } catch {
         set({ user: null, status: "unauthenticated" });
         return null;
      }
   },
}));
