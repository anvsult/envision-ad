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
    private static cachedToken: string | null = null;
    private static tokenExpiration: number = 0;

    /**
     * Retrieves an access token for the Auth0 Management API.
     * Caches the token to avoid hitting rate limits.
     * @returns {Promise<string>} The access token.
     * @throws {Error} If token retrieval fails.
     */
    private static async getAccessToken() {
        // Return cached token if valid (providing a 60s buffer)
        if (this.cachedToken && Date.now() < this.tokenExpiration - 60000) {
            return this.cachedToken;
        }

        try {
            const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    client_id: process.env.AUTH0_MGMT_CLIENT_ID,
                    client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
                    audience: process.env.AUTH0_MGMT_AUDIENCE,
                    grant_type: 'client_credentials',
                }),
            });

            if (!tokenRes.ok) {
                console.error(`Failed to get Auth0 access token: ${tokenRes.status} ${tokenRes.statusText}`);
                throw new Error(`Failed to get Auth0 access token: ${tokenRes.statusText}`);
            }

            const data = await tokenRes.json();
            if (!data.access_token) {
                console.error("Auth0 token response missing access_token:", data);
                throw new Error("Auth0 token response missing access_token");
            }
            // Cache the token
            this.cachedToken = data.access_token;
            // expires_in is in seconds, convert to ms and set expiration
            // If expires_in is not returned, default to 24 hours (86400s) safely or just don't cache deeply if worried. 
            // Standard Auth0 response includes expires_in.
            const expiresIn = data.expires_in || 3600;
            this.tokenExpiration = Date.now() + (expiresIn * 1000);

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
                throw new Error(`Failed to fetch user ${userId}: ${res.statusText}`);
            }

            return res.json();
        } catch (error) {
            console.error("Error in Auth0ManagementService.getUserClient:", error);
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
            let errorMsg = res.statusText || 'Auth0 Update Failed';
            try {
                const errorBody = await res.json();
                errorMsg = errorBody.message || errorBody.error_description || errorBody.error || errorMsg;
            } catch (_) {
                // ignore JSON parse errors
            }
            throw new Error(errorMsg);
        }

        return res.json();
    }

    /**
     * Updates a user's preferred language in their metadata.
     * @param {string} userId - The unique identifier of the user.
     * @param {string} locale - The preferred language code (e.g., "en" or "fr").
     * @returns {Promise<any>} The updated user object.
     * @throws {Error} If the update fails.
     */
    static async updateUserLanguage(userId: string, locale: string) {
        return this.updateUser(userId, {
            user_metadata: {
                preferred_language: locale,
            },
        });
    }

    /**
     * Retrieves a user's preferred language from their metadata.
     * @param {string} userId - The unique identifier of the user.
     * @returns {Promise<string | undefined>} The preferred language code, or undefined  if not set.
     */
    static async getUserLanguage(userId: string): Promise<string | undefined> {
        const user = await this.getUser(userId);
        return user?.user_metadata?.preferred_language || undefined;
    }
}
