// axios.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        handleLocally?: boolean;
    }
}

// Token cache to minimize API calls
let tokenCache: {
    accessToken: string | null;
    expiresAt: number;
} = {
    accessToken: null,
    expiresAt: 0,
};

async function getAccessToken(): Promise<string | null> {
    const now = Date.now();

    // Return cached token if still valid
    if (tokenCache.accessToken && tokenCache.expiresAt > now) {
        return tokenCache.accessToken;
    }

    try {
        // Fetch from your token API route
        const response = await fetch('/api/auth0/token');

        if (!response.ok) {
            console.warn('Failed to fetch access token:', response.status);
            return null;
        }

        const { accessToken } = await response.json();

        // Cache token for 1 minute
        tokenCache.accessToken = accessToken;
        tokenCache.expiresAt = now + 60 * 1000;

        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return null;
    }
}

const createAxiosInstance = (): AxiosInstance => {
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            try {
                const accessToken = await getAccessToken();

                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            } catch (error) {
                console.warn('Auth0: Could not get access token', error);
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor (Global Error Handling)
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const statusCode = error.response?.status;
            const config = error.config;

            // If 'handleLocally' is true, skip global logic
            if (config?.handleLocally) {
                return Promise.reject(error);
            }

            // Global Handling Logic
            if (statusCode === 401) {
                // Clear token cache on 401
                tokenCache = { accessToken: null, expiresAt: 0 };
                // Redirect to login or handle unauthorized
                console.error('Unauthorized - redirecting to login');
            } else if (statusCode && statusCode >= 500) {
                console.error('Server Error:', error.message);
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

const axiosInstance = createAxiosInstance();
export default axiosInstance;