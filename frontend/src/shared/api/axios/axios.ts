import axios, { InternalAxiosRequestConfig } from 'axios';

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


// // axios.ts
// import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
//
// declare module 'axios' {
//     export interface AxiosRequestConfig {
//         handleLocally?: boolean;
//     }
// }
//
// async function getAccessToken(): Promise<string | null> {
//     const now = Date.now();
//
//     try {
//         // Fetch from your token API route
//         const response = await fetch('/api/auth0/token');
//
//         if (!response.ok) {
//             console.warn('Failed to fetch access token:', response.status);
//             return null;
//         }
//
//         const { accessToken } = await response.json();
//
//         return accessToken;
//     } catch (error) {
//         console.error('Error fetching access token:', error);
//         return null;
//     }
// }
//
// const createAxiosInstance = (): AxiosInstance => {
//     const axiosInstance = axios.create({
//         baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
//
//     // Request Interceptor
//     axiosInstance.interceptors.request.use(
//         async (config: InternalAxiosRequestConfig) => {
//             try {
//                 const accessToken = await getAccessToken();
//
//                 if (accessToken) {
//                     config.headers.Authorization = `Bearer ${accessToken}`;
//                 }
//             } catch (error) {
//                 console.warn('Auth0: Could not get access token', error);
//             }
//
//             return config;
//         },
//         (error) => {
//             return Promise.reject(error);
//         }
//     );
//
//     // Response Interceptor (Global Error Handling)
//     axiosInstance.interceptors.response.use(
//         (response) => response,
//         (error: AxiosError) => {
//             const statusCode = error.response?.status;
//             const config = error.config;
//
//             // If 'handleLocally' is true, skip global logic
//             if (config?.handleLocally) {
//                 return Promise.reject(error);
//             }
//
//             // Global Handling Logic
//             if (statusCode === 401) {
//                 // Redirect to login or handle unauthorized
//                 console.error('Unauthorized - redirecting to login');
//                 // if (typeof window !== 'undefined') {
//                 //     window.location.href = '/api/auth0/login';
//                 // }
//             } else if (statusCode && statusCode >= 500) {
//                 console.error('Server Error:', error.message);
//             }
//
//             return Promise.reject(error);
//         }
//     );
//
//     return axiosInstance;
// };
//
// const axiosInstance = createAxiosInstance();
// export default axiosInstance;