export interface UserType {
    employee_id?: string;
    user_id: string; // This usually maps to 'sub' or 'user_id' from Auth0
    name: string;
    nickname: string;
    email: string;
    phone_number?: string;

    // Auth0 specific fields (optional as they might not be present in all contexts)
    sub?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email_verified?: boolean;
    updated_at?: string;
    created_at?: string;
    last_login?: string;
    user_metadata?: {
        bio?: string;
        [key: string]: any;
    };
    [key: string]: any; // Allow for other Auth0 properties
}