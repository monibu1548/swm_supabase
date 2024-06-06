import { ResponseCode } from "./responseCode.ts";

export interface ResponseFormat<T> {
  code: ResponseCode;
  message: string;
  result: T;
}

export function createResponse<T>(
  code: ResponseCode,
  message: string,
  result: T,
): ResponseFormat<T> {
  return { code, message, result };
}
