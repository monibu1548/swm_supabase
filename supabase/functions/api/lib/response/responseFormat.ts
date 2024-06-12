import { ResponseCode } from "./responseCode.ts";

// deno-lint-ignore no-explicit-any
export interface ResponseFormat<T extends Record<string, any> | null> {
  code: ResponseCode;
  message: string;
  result: T;
}

// deno-lint-ignore no-explicit-any
export function createResponse<T extends Record<string, any> | null>(
  code: ResponseCode,
  message: string,
  result: T,
): ResponseFormat<T> {
  return { code, message, result };
}
