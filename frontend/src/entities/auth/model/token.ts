export interface Token {
    iss: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
    scope: string;
    azp: string;
    permissions: string[];
}