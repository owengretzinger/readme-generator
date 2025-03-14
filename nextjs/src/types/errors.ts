import type { RateLimitInfo } from "~/server/api/rate-limit";

export enum ErrorType {
  RATE_LIMIT = "RATE_LIMIT",
  TOKEN_LIMIT = "TOKEN_LIMIT",
  UNAUTHORIZED = "UNAUTHORIZED",
  REPOSITORY_ACCESS = "REPOSITORY_ACCESS",
  REPOSITORY_NOT_FOUND = "REPOSITORY_NOT_FOUND",
  README_NOT_FOUND = "README_NOT_FOUND",
  INTERNAL = "INTERNAL",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  UNKNOWN = "UNKNOWN",
}

export interface BaseErrorResponse {
  type: ErrorType;
  message: string;
}

export interface RateLimitErrorResponse extends BaseErrorResponse {
  type: ErrorType.RATE_LIMIT;
  info: RateLimitInfo;
}

export interface TokenLimitErrorResponse extends BaseErrorResponse {
  type: ErrorType.TOKEN_LIMIT;
  files_analyzed: number;
  estimated_tokens: number;
  largest_files: Array<{ path: string; tokens: number }>;
}

export interface ServerErrorResponse extends BaseErrorResponse {
  type: ErrorType.INTERNAL;
  status?: number;
  details?: unknown;
}

export interface ConnectionErrorResponse extends BaseErrorResponse {
  type: ErrorType.CONNECTION_ERROR;
}

export type ApiErrorResponse =
  | RateLimitErrorResponse
  | TokenLimitErrorResponse
  | ServerErrorResponse
  | ConnectionErrorResponse
  | BaseErrorResponse;

export const isRateLimitError = (
  error: ApiErrorResponse,
): error is RateLimitErrorResponse => {
  return error.type === ErrorType.RATE_LIMIT;
};

export const isTokenLimitError = (
  error: ApiErrorResponse,
): error is TokenLimitErrorResponse => {
  return error.type === ErrorType.TOKEN_LIMIT;
};

export const createRateLimitError = (
  info: RateLimitInfo,
  message: string,
): RateLimitErrorResponse => ({
  type: ErrorType.RATE_LIMIT,
  info,
  message,
});

export const createTokenLimitError = (
  files_analyzed: number,
  estimated_tokens: number,
  largest_files: Array<{ path: string; tokens: number }>,
): TokenLimitErrorResponse => ({
  type: ErrorType.TOKEN_LIMIT,
  message: `The repository content is ~${estimated_tokens.toLocaleString()} tokens, which exceeds the limit of ${(100000).toLocaleString()} tokens. Please exclude some files and try again.`,
  files_analyzed,
  estimated_tokens,
  largest_files,
});

export const createUnauthorizedError = (): BaseErrorResponse => ({
  type: ErrorType.UNAUTHORIZED,
  message: "Unauthorized - check your API token",
});

export const createRepositoryAccessError = (): BaseErrorResponse => ({
  type: ErrorType.REPOSITORY_ACCESS,
  message:
    "Cannot access repository. Make sure the repository exists and is public.",
});

export const createRepositoryNotFoundError = (): BaseErrorResponse => ({
  type: ErrorType.REPOSITORY_NOT_FOUND,
  message: "Repository not found. Please check the URL and try again.",
});

export const createServerError = (
  message: string,
  status?: number,
  details?: unknown,
): ServerErrorResponse => ({
  type: ErrorType.INTERNAL,
  message,
  status,
  details,
});

export const createConnectionError = (): ConnectionErrorResponse => ({
  type: ErrorType.CONNECTION_ERROR,
  message:
    "Failed to connect to the server. This could be due to internet connectivity issues, a server that's temporarily down, or incorrect configuration. Please try again later or contact me if the issue persists.",
});
