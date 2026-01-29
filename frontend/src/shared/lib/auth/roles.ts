export const AUTH0_ROLES = {
    ADMIN: 'rol_9wWgi8TuwYCTdsqX',
    BUSINESS_OWNER: 'rol_fFGTiHiGm6EV36pD',
    MEDIA_OWNER: 'rol_7n9XL2cqwJzjRfi4',
    ADVERTISER: 'rol_q4MqASyi5dAiihSJ'
}

export const ASSIGNABLE_ROLE_IDS = [
    AUTH0_ROLES.BUSINESS_OWNER,
    AUTH0_ROLES.MEDIA_OWNER,
    AUTH0_ROLES.ADVERTISER,
];

export const PROTECTED_ROLE_IDS = [
    AUTH0_ROLES.ADMIN,
];

export type RoleId = typeof AUTH0_ROLES[keyof typeof AUTH0_ROLES];