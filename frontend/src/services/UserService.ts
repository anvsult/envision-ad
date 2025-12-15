export interface UpdateUserRequest {
    given_name?: string;
    family_name?: string;
    nickname?: string;
    name?: string;
}

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<any> => {
    const res = await fetch(`/api/auth0/update-user/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update user: ${res.statusText}`);
    }

    return res.json();
};
