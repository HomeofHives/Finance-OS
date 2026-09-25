import { apiRequest } from "../../shared/api/client";
import type { User } from "../../entities/user/model";

export interface RegisterInput {
   name: string;
   email: string;
   password: string;
}

export interface LoginInput {
   email: string;
   password: string;
}

const AUTH_RESOURCE = "/auth";

export const authApi = {
   async register(input: RegisterInput): Promise<User> {
      const data = await apiRequest<{ user: User }>(`${AUTH_RESOURCE}/register`, {
         method: "POST",
         body: input,
      });
      return data.user;
   },

   async login(input: LoginInput): Promise<User> {
      const data = await apiRequest<{ user: User }>(`${AUTH_RESOURCE}/login`, {
         method: "POST",
         body: input,
      });
      return data.user;
   },

   async me(): Promise<User> {
      const data = await apiRequest<{ user: User }>(`${AUTH_RESOURCE}/me`);
      return data.user;
   },

   async logout(): Promise<void> {
      await apiRequest<void>(`${AUTH_RESOURCE}/logout`, { method: "POST" });
   },
};
