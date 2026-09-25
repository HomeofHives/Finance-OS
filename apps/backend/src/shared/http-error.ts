import type { ErrorDetails } from "./api-response.js";

export class HttpError extends Error {
   readonly statusCode: number;
   readonly code: string;
   readonly details?: ErrorDetails;

   constructor(statusCode: number, code: string, message: string, details?: ErrorDetails) {
      super(message);
      this.name = "HttpError";
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
   }
}
