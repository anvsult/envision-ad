/**
 * Service for interacting with the Auth0 Management API.
 * Uses Client Credentials Grant to obtain an access token.
 */
export class Auth0ManagementService {
    /**
     * Retrieves an access token for the Auth0 Management API.
     * @returns {Promise<string>} The access token.
     * @throws {Error} If token retrieval fails.
     */
    private static async getAccessToken() {
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
            return data.access_token;
        } catch (error) {
            console.error("Error in Auth0ManagementService.getAccessToken:", error);
            throw error;
        }
    }

    /**
     * Retrieves a user's details from Auth0.
     * @param {string} userId - The unique identifier of the user (e.g., "auth0|123456").
     * @returns {Promise<any | null>} The user object if found, or null if not found or an error occurs.
     */
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

    /**
     * Updates a user's details in Auth0.
     * @param {string} userId - The unique identifier of the user.
     * @param {any} data - The partial user object containing fields to update.
     * @returns {Promise<any>} The updated user object.
     * @throws {Error} If the update fails.
     */
    static async updateUser(userId: string, data: any) {
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
