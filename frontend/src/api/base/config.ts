/**
 * API Configuration
 * Centralized configuration for API endpoints and base URL
 */

// Base API URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// API Version
export const API_VERSION = '/api/v1';

// Full API URL
export const API_URL = `${API_BASE_URL}${API_VERSION}`;