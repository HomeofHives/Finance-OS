export type ErrorDetails = Record<string, unknown> | unknown[];

export interface ApiSuccessResponse<T, M = undefined> {
   success: true;
   data: T;
   meta?: M;
}

export interface ApiErrorResponse {
   success: false;
   error: {
      code: string;
      message: string;
      details?: ErrorDetails;
   };
   requestId?: string;
}

export interface ApiErrorResponseOptions {
   details?: ErrorDetails;
   requestId?: string;
}

export function createApiSuccess<T, M = undefined>(data: T, meta?: M): ApiSuccessResponse<T, M> {
   if (meta === undefined) {
      return { success: true, data: data };
   }
   return { success: true, data: data, meta: meta };
}

export function createApiErrorResponse(
   code: string,
   message: string,
   options?: ApiErrorResponseOptions,
): ApiErrorResponse {
   return {
      success: false,
      error: {
         code,
         message,
         ...(options?.details !== undefined ? { details: options.details } : {}),
      },
      ...(options?.requestId !== undefined ? { requestId: options.requestId } : {}),
   };
}
