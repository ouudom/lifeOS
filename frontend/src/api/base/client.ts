/**
 * Base HTTP Client
 * Axios-based HTTP client with interceptors for request/response handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from './config';
import { BaseResponse, ErrorResponse, ApiError, isErrorResponse } from './types';

/**
 * Create and configure axios instance
 */
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_URL,
        timeout: 30000, // 30 seconds
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            // Add authentication token if available
            // const token = getAuthToken(); // Implement this based on your auth strategy
            // if (token) {
            //   config.headers.Authorization = `Bearer ${token}`;
            // }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response: AxiosResponse<BaseResponse>) => {
            // Extract data from successful response
            return response;
        },
        (error) => {
            // Handle error responses
            if (error.response) {
                const responseData = error.response.data;

                // Check if it's an error response from our backend
                if (isErrorResponse(responseData)) {
                    throw new ApiError(responseData);
                }

                // Handle other error formats
                throw new ApiError({
                    status: 'error',
                    code: error.response.status,
                    message: error.message || 'An unexpected error occurred',
                    errors: null,
                });
            }

            // Network error or request setup error
            throw new ApiError({
                status: 'error',
                code: 0,
                message: error.message || 'Network error',
                errors: null,
            });
        }
    );

    return instance;
};

/**
 * Base API Client
 */
class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = createAxiosInstance();
    }

    /**
     * GET request
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        const response = await this.instance.get<BaseResponse<T>>(url, config);
        return response.data;
    }

    /**
     * POST request
     */
    async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<BaseResponse<T>> {
        const response = await this.instance.post<BaseResponse<T>>(url, data, config);
        return response.data;
    }

    /**
     * PUT request
     */
    async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<BaseResponse<T>> {
        const response = await this.instance.put<BaseResponse<T>>(url, data, config);
        return response.data;
    }

    /**
     * PATCH request
     */
    async patch<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<BaseResponse<T>> {
        const response = await this.instance.patch<BaseResponse<T>>(url, data, config);
        return response.data;
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        const response = await this.instance.delete<BaseResponse<T>>(url, config);
        return response.data;
    }

    /**
     * Get the underlying axios instance for advanced usage
     */
    getAxiosInstance(): AxiosInstance {
        return this.instance;
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;
