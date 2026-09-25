import { API_BASE_URL } from "../config/env";

export interface ApiErrorPayload {
   error: {
      code: string;
      message: string;
      details?: unknown;
   };
}

export class ApiError extends Error {
   readonly status: number;
   readonly code: string;
   readonly details?: unknown;

   constructor(status: number, code: string, message: string, details?: unknown) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
      this.details = details;
   }
}

interface RequestOptions {
   method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
   body?: unknown;
}

const toUrl = (path: string) => `${API_BASE_URL}${path}`;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
   const { method = "GET", body } = options;
   const response = await fetch(toUrl(path), {
      method,
      credentials: "include",
      headers:
         body !== undefined
            ? {
                 "content-type": "application/json",
              }
            : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
   });

   if (response.status === 204) {
      return undefined as T;
   }

   const payload = (await response.json().catch(() => null)) as
      (T & Partial<ApiErrorPayload>) | null;

   if (!response.ok) {
      const errorBody = payload as ApiErrorPayload | null;
      throw new ApiError(
         response.status,
         errorBody?.error.code ?? "REQUEST_FAILED",
         errorBody?.error.message ?? `Request failed with status ${response.status}.`,
         errorBody?.error.details,
      );
   }

   return payload as T;
}
