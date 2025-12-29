export interface UpdateUserRequest {
    givenName?: string;
    familyName?: string;
    nickname?: string;
    name?: string;
    userMetadata?: {
        bio?: string;
        [key: string]: any;
    };
}

// Minimal User interface, extend as needed to match your backend response
export interface User {
    userId: string;
    sub?: string;
    email: string;
    givenName?: string;
    familyName?: string;
    nickname?: string;
    name?: string;
    userMetadata?: {
        bio?: string;
        [key: string]: any;
    };
    emailVerified?: boolean;
    picture?: string;
    [key: string]: any;
}

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<User> => {
    const res = await fetch(`/api/auth0/update-user/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        let errorBody: string | undefined;
        try {
            const contentType = res.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                errorBody = JSON.stringify(data);
            } else {
                errorBody = await res.text();
            }
        } catch (e) {
            // Ignore parsing errors, leave errorBody undefined
        }
        throw new Error(`Failed to update user: ${res.statusText}${errorBody ? ` - ${errorBody}` : ""}`);
    }

    return res.json();
};

export const mapAuth0UserToUser = (auth0User: any): User => {
    return {
        userId: auth0User.user_id || auth0User.sub,
        sub: auth0User.sub,
        email: auth0User.email,
        givenName: auth0User.given_name,
        familyName: auth0User.family_name,
        nickname: auth0User.nickname,
        name: auth0User.name,
        userMetadata: auth0User.user_metadata,
        emailVerified: auth0User.email_verified,
        picture: auth0User.picture,
        updatedAt: auth0User.updated_at,
        createdAt: auth0User.created_at,
        lastLogin: auth0User.last_login,
        ...auth0User // Fallback for any other properties
    };
};
