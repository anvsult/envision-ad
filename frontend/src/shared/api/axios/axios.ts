import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import { getAccessToken} from "@auth0/nextjs-auth0";

// Extend AxiosRequestConfig to include custom properties if needed
declare module 'axios' {
    export interface AxiosRequestConfig {
        handleLocally?: boolean;
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
    axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
            // // For client-side requests
            // if (typeof window !== 'undefined') {
            //     const accessToken = localStorage.getItem('access_token');
            //     if (accessToken) {
            //         config.headers.Authorization = `Bearer ${accessToken}`;
            //     }
            // }
            // // For server-side requests
            // else {
                try {
                    // Destructure accessToken from the result object
                    const accessToken = await getAccessToken();

                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    }
                } catch (error) {
                    // This catch is important: getAccessToken throws if the user is not logged in.
                    // We log it and let the request proceed; the 401 response interceptor will catch it.
                    console.warn("Auth0: No active session found.");
                }
            // }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    // Response Interceptor (Global Error Handling)
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const statusCode = error.response?.status;
            const config = error.config;

            // If 'handleLocally' is true, skip global logic and throw error to the component
            if (config?.handleLocally) {
                return Promise.reject(error);
            }

            // Global Handling Logic
            if (statusCode === 401) {
                // Logic: Redirect to login or refresh token
            } else if (statusCode && statusCode >= 500) {
                // Logic: Trigger a global "Server Error" toast
                console.error("Server Error:", error.message);
            }

            return Promise.reject(error);
        }
    );



    return axiosInstance;
}

const axiosInstance = createAxiosInstance();
export default axiosInstance;