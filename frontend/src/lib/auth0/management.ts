import { UpdateUserRequest } from "@/services/UserService";

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export class Auth0ManagementService {
    private static async getAccessToken() {
        // Check if cached token is still valid (with 5-minute buffer)
        const now = Date.now();
        if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
            return cachedToken;
        }

        try {
            const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    client_id: process.env.AUTH0_MGMT_CLIENT_ID,
                    client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
                    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                    grant_type: 'client_credentials',
                }),
            });

            if (!tokenRes.ok) {
                const errorText = await tokenRes.text();
                console.error(`Failed to get Auth0 access token: ${tokenRes.status} ${tokenRes.statusText} - ${errorText}`);
                throw new Error(`Failed to get Auth0 access token: ${tokenRes.statusText}`);
            }

            const data = await tokenRes.json();
            if (!data.access_token) {
                console.error("Auth0 token response missing access_token:", data);
                throw new Error("Auth0 token response missing access_token");
            }
            
            // Cache the token with expiry (default 24 hours, use expires_in if provided)
            cachedToken = data.access_token;
            const expiresInSeconds = data.expires_in || 86400; // Default to 24 hours
            tokenExpiry = Date.now() + expiresInSeconds * 1000;
            
            return data.access_token;
        } catch (error) {
            console.error("Error in Auth0ManagementService.getAccessToken:", error);
            throw error;
        }
    }

    static async getUser(userId: string) {
        try {
            const token = await this.getAccessToken();
            const res = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store' // Ensure we always get fresh data
                }
            );

            if (!res.ok) {
                console.error(`Failed to fetch user ${userId}: ${res.statusText}`);
                return null;
            }

            return res.json();
        } catch (error) {
            console.error("Error in Auth0ManagementService.getUser:", error);
            return null;
        }
    }

    static async updateUser(userId: string, data: UpdateUserRequest) {
        const token = await this.getAccessToken();
        const res = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) {
            throw new Error(`Auth0 Update Failed: ${res.statusText}`);
        }

        return res.json();
    }
}
