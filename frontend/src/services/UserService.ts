import { UserType } from "@/types/UserType";

// Minimal interface for the update payload (snake_case to match Auth0)
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

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserType> => {
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

