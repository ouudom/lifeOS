/**
 * API Response Types
 * TypeScript types matching the backend response structure
 */

/**
 * Base successful response structure
 * Matches backend's BaseResponse[T] from app/core/schemas.py
 */
export interface BaseResponse<T = unknown> {
    status: string;
    code: number;
    message: string;
    data: T | null;
}

/**
 * Error response structure
 * Matches backend's ErrorResponse from app/core/schemas.py
 */
export interface ErrorResponse {
    status: string;
    code: number;
    message: string;
    errors?: unknown[] | null;
}

/**
 * Custom API Error class
 * Thrown when API requests fail
 */
export class ApiError extends Error {
    public readonly code: number;
    public readonly status: string;
    public readonly errors?: unknown[];

    constructor(errorResponse: ErrorResponse) {
        super(errorResponse.message);
        this.name = 'ApiError';
        this.code = errorResponse.code;
        this.status = errorResponse.status;
        this.errors = errorResponse.errors || undefined;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'status' in response &&
        (response as ErrorResponse).status === 'error'
    );
}

/**
 * Type guard to check if a response is a base response
 */
export function isBaseResponse<T = unknown>(response: unknown): response is BaseResponse<T> {
    return (
        typeof response === 'object' &&
        response !== null &&
        'status' in response &&
        'code' in response &&
        'message' in response &&
        'data' in response
    );
}
