import axios, { InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

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

const TOKEN_STORAGE_KEY = 'auth_token';
// Buffer in seconds — refetch before the token actually expires
const EXP_BUFFER = 60;
let tokenFetchPromise: Promise<string | null> | null = null;

function getCachedToken(): string | null {
    try {
        const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (!stored) return null;

        const { exp } = jwtDecode<{ exp: number }>(stored);
        const now = Math.floor(Date.now() / 1000);

        if (exp - EXP_BUFFER > now) {
            return stored;
        }

        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    } catch {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }
}

async function getToken(): Promise<string | null> {
    const cached = getCachedToken();
    if (cached) return cached;

    // If a fetch is already in flight, reuse it to avoid duplicate requests
    if (tokenFetchPromise) return tokenFetchPromise;

    tokenFetchPromise = (async () => {
        try {
            const response = await fetch('/api/auth0/token');
            if (response.ok) {
                const { accessToken } = await response.json();
                if (accessToken) {
                    sessionStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
                    return accessToken;
                }
            }
            return null;
        } catch (error) {
            console.error("Axios: Failed to inject auth token", error);
            return null;
        } finally {
            tokenFetchPromise = null;
        }
    })();

    return tokenFetchPromise;
}

axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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