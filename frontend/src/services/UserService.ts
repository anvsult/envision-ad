export interface UpdateUserRequest {
    given_name?: string;
    family_name?: string;
    nickname?: string;
    name?: string;
    user_metadata?: {
        bio?: string;
        [key: string]: any;
    };
}

// Minimal User interface, extend as needed to match your backend response
export interface User {
    user_id: string;
    email: string;
    given_name?: string;
    family_name?: string;
    nickname?: string;
    name?: string;
    user_metadata?: {
        bio?: string;
        [key: string]: any;
    };
    [key: string]: any; // Allow extra fields if present
}

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<User> => {
    const res = await fetch(`/api/auth0/update-user/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
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
