export class Auth0ManagementService {
    private static async getAccessToken() {
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

        const data = await tokenRes.json();
        return data.access_token;
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
