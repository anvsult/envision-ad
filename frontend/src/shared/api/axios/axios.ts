import axios, { InternalAxiosRequestConfig } from 'axios';
import {getAccessToken} from "@auth0/nextjs-auth0";

declare module 'axios' {
    export interface AxiosRequestConfig {
        handleLocally?: boolean;
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Only attempt to get the token on the client side
        if (typeof window !== 'undefined') {
            try {
                // Fetch the token from your internal Next.js Auth0 route
                const response = await fetch('/api/auth0/token');
                if (response.ok) {
                    const { accessToken } = await response.json();
                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    }
                }
            } catch (error) {
                console.error("Axios: Failed to inject auth token", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.config?.handleLocally) return Promise.reject(error);

        if (error.response?.status === 401) {
            // Use window.location for client-side redirect
            // if (typeof window !== 'undefined') window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;